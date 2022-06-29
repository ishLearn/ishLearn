import axios from 'axios'
import { Ref } from 'vue'

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
  visibility: Visibility | string
  updatedBy: number | string
  createdBy: number | string
  createDate?: Date
  updatedDate?: Date
  description?: string

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
    }: {
      id: ID
      title: string
      visibility: Visibility
      updatedBy: number | string
      createdBy: number | string
      createDate?: Date
      updatedDate?: Date
      description?: string
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

    if (typeof this.description === 'undefined') {
      this.fetchDescription(updateRef)
    }
  }

  static async getProductById(pid: string, updateRef?: Ref<number>): Promise<Product> {
    return new Promise<Product>((resolve, reject) => {
      axios
        .get(`/api/products/${pid}`)
        .then((res) => {
          const [p] = res.data
          return resolve(new Product(p, updateRef))
        })
        .catch((err) => reject(err))
    })
  }

  async fetchDescription(updateRef?: Ref<number>): Promise<void> {
    this.description = (
      await axios.post('/api/files/download', {
        filename: `${this.id}/description.md`,
      })
    ).data

    if (updateRef) updateRef.value++
  }
}
