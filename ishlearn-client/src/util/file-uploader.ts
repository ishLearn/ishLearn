import api from '@/services/api'
import { UploadableFile } from './file-list'

export async function upladfile(file: UploadableFile, pid: string) {
  const formData = new FormData()
  formData.append('file', file.file)
  formData.append('filename', file.file.name)
  formData.append('projectId', pid)

  file.status = 'loading'
  const response = await api.post('/files/upload/', formData)

  file.status = response.status == 206 || response.status == 200

  return response
}

export function uploadFiles(files: UploadableFile[], pid: string) {
  return Promise.all(files.map((file) => upladfile(file, pid)))
}
