import { Ref } from 'vue'

export type GenericInputData = {
  value: Ref<string | boolean>
  type: string
  label: string
  id: string
  name: string
  mandatory: boolean
  placeholder: string
}

export type GenericInputs = {
  [key: string]: GenericInputData
}
