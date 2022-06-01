import { Ref } from 'vue'

export type GenericInputData<T> = {
  value: Ref<T>
  type: string
  label: string
  id: string
  name: string
  mandatory: boolean
  placeholder: string
}

export type GenericInputs<T> = {
  [key: string]: GenericInputData<T>
}
