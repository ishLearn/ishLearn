import { Entity, Schema, Repository, Client } from 'redis-om'
import { createClient } from 'redis'

import { KeyValue } from '../types/redis'

import Product from '../models/Product'

let useRedis: boolean = true
// Set to true to activate redis OM, but no significant increase
const useRedisOM: boolean = false

// Redis client Setup
const REDIS_URL = `redis://${process.env.REDIS_URL || 'localhost:6379'}`
const REDIS_TTL = Number(process.env.REDIS_TTL) || 2 * 60 * 60 // Default to two hours

let client = createClient({ url: REDIS_URL })
let clientOM: Client

// Redis-OM setup
/**
 * @author @SebastianThomas
 */
interface ProductEntity {
  ID: import('../types/ids').ID
  title: string
  visibility: string
  updatedBy: string | number
  createdBy: string | number
  createDate: Date | undefined
  updatedDate: Date | undefined
  avgRating: number | string
}
/**
 * @author @SebastianThomas
 */
class ProductEntity extends Entity {}

const productSchema = new Schema(ProductEntity, {
  ID: { type: 'string' },
  firstName: { type: 'string' },
  lastName: { type: 'string' },
  email: { type: 'string' },
  rank: { type: 'string' },
  birthday: { type: 'date' },
})

/**
 * Redis Repository (OM) for Products
 */
export let productRepo: Repository<ProductEntity> | null = null
/**
 * Try to connect Redis client to server
 */
export const connectRedisClient = async () => {
  try {
    await client.connect()
    clientOM = await new Client().use(client)

    if (!useRedisOM) return
    productRepo = clientOM.fetchRepository(productSchema)
    await productRepo.createIndex()
  } catch (err) {
    console.log('Not using Redis.')
    useRedis = false
  }
}

// Methods for easy interaction
/**
 * Add a product to the repository; with the default TTL.
 * @param p Product to add
 * @returns The Redis ID for the added product
 */
export const addProduct = async (p: Product) => {
  if (!useRedis || !useRedisOM) return

  const alreadyAdded: {
    id: string
    product: ProductEntity | null
  } = {
    id: '',
    product: null,
  }
  if (p.id) {
    const added = await searchProductById(p.id)
    if (!added) return
    alreadyAdded.product = added
    alreadyAdded.id = added.ID ?? ''
  }

  // Return if the product repo has not been initialized properly
  if (!productRepo || !useRedis) return

  const product = alreadyAdded.product ?? productRepo.createEntity()

  product.ID = p.id
  product.title = p.title
  product.visibility = p.visibility
  product.updatedBy = p.updatedBy
  product.createdBy = p.createdBy
  product.createDate = p.createDate
  product.updatedDate = p.updatedDate
  product.avgRating = p.avgRating || 0

  const id = await productRepo.save(product)

  await productRepo.expire(id, REDIS_TTL)
  return id
}

/**
 * Clear the complete cache repository (with Products). Use carefully, may result in higher latency during the first API calls.
 * @returns The number of deleted entries or undefined if the redis OM is not used
 */
export const clearProductRepo = async () => {
  if (!useRedis || !useRedisOM || productRepo === null) return

  const allIds = (await productRepo.search().returnAll()).map(
    (p: ProductEntity) => p.entityId
  )

  await Promise.all(allIds.map(async id => productRepo?.remove(id)))
  return allIds.length
}

/**
 * Get the redis client instance
 * @returns The redis client
 * @throws an error if the client is not connected to server
 * @see #connectRedisClient
 */
export const getRedisClient = () => {
  if (!useRedis) throw new Error('Redis is not available')

  if (client == null || !client.isOpen)
    throw new Error(`Redis Client not connected!`)
  return client
}

/**
 * Close the OM client and Quit the client.
 * @returns true if the client was connected and successfully closed, false if the client was not connected.
 */
export const closeRedisConnection = async () => {
  if (!useRedis) return false

  if (client == null || !client.isOpen) return false

  if (useRedisOM) await clientOM.close()
  await client.quit()
  return true
}

/**
 * Find a value by key in Redis cache DB.
 * @param key the key to search for
 * @returns The value associated with the key or null if the value was not found
 */
export const getValue = async (key: string) => {
  if (!useRedis) return

  return await getRedisClient().get(key)
}
/**
 * Set a value by key in Redis cache DB.
 * @param key the key to search for
 * @param value the value to set
 * @returns The result of SET operation
 */
export const setValue = async (key: string, value: string) => {
  if (!useRedis) return

  return await getRedisClient().set(key, value)
}
/**
 * Append a value to a key in Redis cache DB.
 * @param key Key to append the value to
 * @param value Value to append
 * @returns The result of the APPEND operation
 */
export const appendValue = async (key: string, value: string) => {
  if (!useRedis) return

  return await getRedisClient().append(key, value)
}
/**
 * Search products with key-value from Redis cache DB.
 * @param offset The paging offset, one page is 25 results
 * @param k Key-Value-pairs to search for
 * @returns An Array of ProductEntities
 */
export const searchProducts = async (offset: number = 0, ...k: KeyValue[]) => {
  if (!useRedis || !useRedisOM || !productRepo) return []

  const search = productRepo.search()
  k.forEach(k => {
    search.where(k.key).match(k.value)
  })
  const res = await search.returnPage(offset, 25)
  return res
}
/**
 * Search a product by its Redis ID.
 * @param id The ID to search for.
 * @returns The result found in Redis or a ProductEntity with only `null`-values.
 */
export const searchProductById = async (
  id: string
): Promise<ProductEntity | null> => {
  if (!useRedis || !useRedisOM || !productRepo) return null

  return await productRepo.fetch(id)
}

/**
 * Get recently added products.
 * @param offset How many items to skip
 * @param count How many items to return
 * @returns a Promise that resolves to an array containing the items
 */
export const getRecentProducts = async (
  offset: number = 0,
  count: number = 10
): Promise<ProductEntity[]> => {
  if (!useRedisOM || !useRedisOM || !productRepo) return []

  return productRepo
    .search()
    .return.page((await productRepo.search().count()) - offset - count, count)
}
