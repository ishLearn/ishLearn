import { Entity, Schema, Repository, Client } from 'redis-om'
import { createClient } from 'redis'

import { KeyValue } from '../types/redis'

import Product from '../models/Product'

// Redis client Setup
const REDIS_URL = `redis://${process.env.REDIS_URL || 'localhost:6379'}`
const REDIS_TTL = Number(process.env.REDIS_TTL) || 2 * 60 * 60 // Default to two hours

let client = createClient({ url: REDIS_URL })
let clientOM: Client

// Redis-OM setup
interface ProductEntity {
  ID: import('../types/ids').ID
  title: string
  visibility: string
  updatedBy: string | number
  createdBy: string | number
  createDate: Date | undefined
  updatedDate: Date | undefined
}
class ProductEntity extends Entity {}

const productSchema = new Schema(ProductEntity, {
  ID: { type: 'string' },
  firstName: { type: 'string' },
  lastName: { type: 'string' },
  email: { type: 'string' },
  rank: { type: 'string' },
  birthday: { type: 'date' },
})

export let productRepo: Repository<ProductEntity>
export const connectRedisClient = async () => {
  await client.connect()
  clientOM = await new Client().use(client)

  productRepo = clientOM.fetchRepository(productSchema)
  await productRepo.createIndex()
}

// Methods for easy interaction
export const addProduct = async (p: Product) => {
  const alreadyAdded: {
    id: string
    product: ProductEntity | null
  } = {
    id: '',
    product: null,
  }
  if (p.id) {
    const added = await searchProductById(p.id)
    alreadyAdded.product = added
    alreadyAdded.id = added.ID ?? ''
  }

  const product = alreadyAdded.product ?? productRepo.createEntity()

  product.ID = p.id
  product.title = p.title
  product.visibility = p.visibility
  product.updatedBy = p.updatedBy
  product.createdBy = p.createdBy
  product.createDate = p.createDate
  product.updatedDate = p.updatedDate

  const id = await productRepo.save(product)

  await productRepo.expire(id, REDIS_TTL)
  return id
}

export const clearProductRepo = async () => {
  const allIds = (await productRepo.search().returnAll()).map(
    (p: ProductEntity) => p.entityId
  )
  await Promise.all(allIds.map(async id => productRepo.remove(id)))
  return allIds.length
}

export const getRedisClient = () => {
  if (client == null || !client.isOpen)
    throw new Error(`Redis Client not connected!`)
  return client
}

export const closeRedisConnection = async () => {
  if (client == null || !client.isOpen) return false

  await clientOM.close()
  await client.quit()
  return true
}

export const getValue = async (key: string) => {
  return await getRedisClient().get(key)
}
export const setValue = async (key: string, value: string) => {
  return await getRedisClient().set(key, value)
}
export const appendValue = async (key: string, value: string) => {
  return await getRedisClient().append(key, value)
}
export const searchProduct = async (offset: number = 0, ...k: KeyValue[]) => {
  const search = productRepo.search()
  k.forEach(k => {
    search.where(k.key).match(k.value)
  })
  const res = await search.returnPage(offset, 25)
  return res
}
export const searchProductById = (id: string) => {
  return productRepo.fetch(id)
}
