import api from '@/services/api'
import { User } from '@/types/Users'
import { Ref } from 'vue'

export default async (user: Ref<User | null>, uid: string) => {
  user.value = (await api.get<User>(`/users/${uid}`)).data
}
