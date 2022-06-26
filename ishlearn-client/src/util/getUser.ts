import api from '@/services/api'
import { ref } from 'vue'
import { User } from '@/types/Users'

// Kannst du mir hier mit den Types helfen?
const getUserByID = async (uid: string) => {
  console.log('REQuest User')
  const user = ref()
  await api.get(`/users/${uid}/`).then((res) => {
    user.value = res.data
  })
  console.log(user.value)
  return user.value
}
export default getUserByID
