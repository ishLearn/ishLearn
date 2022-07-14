import { AxiosError } from 'axios'
import api from './api'

export const updateTags = async (productId: string, tags: string[], add: boolean) => {
  try {
    const result = await api.put<{ success: boolean; productId: string }>(
      `/product/${productId}/tags`,
      {
        tags,
        add,
      },
    )
    return result.data.success
      ? 'Die Tags wurden geupdated.'
      : 'Die Anfrage konnte leider nicht erfolgreich abgeschlossen werden.'
  } catch (err: unknown) {
    // Permission denied
    if ((err as AxiosError).response?.status === 403)
      return 'Du hast nicht die notwendigen Berechtigungen, das Produkt zu bearbeiten.'
    // Internal Server Error
    if ((err as AxiosError).response?.status || 400 >= 500)
      return 'Der Server kann die Anfrage aktuell nicht bearbeiten.'
    // Other Error (4xx)
    return 'Die Anfrage ist nicht richtig konfiguriert.'
  }
}
