export enum Visibility {
  PRIVATE = 'private',
  SCHOOL_PRIVATE = 'schoolPrivate',
  LINK = 'link',
  PUBLIC = 'public',
}

export type ID = string | undefined

export type Product = {
  id?: ID
  title: string
  visibility: Visibility | string
  updatedBy: number | string
  createdBy: number | string
  createDate?: Date
  updatedDate?: Date
  description?: string
}
