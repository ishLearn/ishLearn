import { Ref } from 'vue'
import { Store } from 'pinia'

import api from '@/services/api'
import { UserStoreState } from '@/store/auth.module'
import { Product } from '@/types/Products'
import { User } from '@/types/Users'

export const getUser = async (user: Ref<User | null>, uid: string) => {
  user.value = (await api.get<User>(`/users/${uid}`)).data
}

export const setEditPermission = async (
  mayEdit: Ref<boolean>,
  user: Store<'user', UserStoreState>,
  project: Ref<Product | null>,
) => {
  mayEdit.value = user.status.loggedIn && user.user?.id === project.value?.createdBy

  mayEdit.value = (
    await api.get<{ hasEditPermission: boolean }>(`/products/${project.value?.id}/permission`)
  ).data.hasEditPermission
}
