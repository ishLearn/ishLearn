import api from '@/services/api'
import { User } from '@/types/Users'

// Ich komme nicht weiter
// Gibt es eine API Schnittstelle, mit der ich das Benutzerprofil eines belibiegen
// Nutzers abrufen kann?
const getUserByID = (uid: string) => {
  api.get('/users/').then((res) => {
    return res.data.user
  })
}
