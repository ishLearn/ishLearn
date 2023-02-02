import axios, { AxiosResponse } from 'axios'
import api from '@/services/api'
import { Ref } from 'vue'
import { MediaMeta } from './Media'

export enum Visibility {
  PRIVATE = 'private',
  SCHOOL_PRIVATE = 'schoolPrivate',
  LINK = 'link',
  PUBLIC = 'public',
}

export type ID = string | undefined

export class Product {
  id?: ID
  title: string
  visibility: Visibility
  updatedBy: string
  createdBy: string
  createDate?: Date
  updatedDate?: Date
  description?: string
  media?: MediaMeta[]

  constructor(
    {
      id,
      title,
      visibility,
      updatedBy,
      createdBy,
      createDate,
      updatedDate,
      description,
      media,
    }: {
      id: ID
      title: string
      visibility: Visibility
      updatedBy: string
      createdBy: string
      createDate?: Date
      updatedDate?: Date
      description?: string
      media?: MediaMeta[]
    },
    updateRef?: Ref<number>,
  ) {
    this.id = id
    this.title = title
    this.visibility = visibility
    this.updatedBy = updatedBy
    this.createdBy = createdBy
    this.createDate = createDate
    this.updatedDate = updatedDate
    this.description = description
    this.media = media

    if (typeof this.description === 'undefined') {
      this.fetchDescription(updateRef)
      this.fetchMediaMeta()
    }
  }

  static async getProductById(pid: string, updateRef?: Ref<number>): Promise<Product> {
    return new Promise<Product>((resolve, reject) => {
      api
        .get(`/products/${pid}`)
        .then((res: AxiosResponse<Product | Product[] | null>) => {
          console.log('Res Data:')
          console.log(res.data)
          const [p] = res.data instanceof Product ? [res.data] : res.data || []
          if (!res.data || p === null) throw res

          return resolve(new Product({ ...p, id: pid }, updateRef)) // To satisfy TS, the id must be explicitly passed to the constructor
        })
        .catch((err) => reject(err))
    })
  }

  static async getTrendingProducts(): Promise<Product[]> {
    return (await api.get('/products/trending')).data.products || []
  }

  async fetchDescription(updateRef?: Ref<number>): Promise<boolean> {
    this.description = (
      await axios.post('/api/files/download', {
        filename: `${this.id}/description.md`,
      })
    ).data

    if (updateRef) updateRef.value++

    return true
  }

  async fetchMediaMeta(updateRef?: Ref<number>): Promise<boolean> {
    api.get(`/products/${this.id}/media`).then((res) => {
      this.media = res.data.media.filter((m: MediaMeta) => m.filename !== 'description.md')
      if (updateRef) updateRef.value++
    })

    return true
  }

  async delete(): Promise<boolean> {
    await api.delete(`/products/${this.id}`)

    return true
  }
}
