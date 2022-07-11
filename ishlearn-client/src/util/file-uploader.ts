import api from '@/services/api'
import { UploadableFile } from './file-list'

export async function uploadfile(file: UploadableFile, pid: string, overrideIfNecessary?: boolean) {
  const formData = new FormData()
  formData.append('file', file.file)
  formData.append('filename', file.file.name)
  formData.append('projectId', pid)
  if (typeof overrideIfNecessary !== 'undefined')
    formData.append('overrideIfNecessary', overrideIfNecessary ? 'true' : 'false')

  file.status = 'loading'

  const response = await api.post('/files/upload/', formData)

  file.status = response.status == 206 || response.status == 200

  return response
}

export function uploadFiles(files: UploadableFile[], pid: string, overrideIfNecessary?: boolean) {
  return Promise.all(files.map((file) => uploadfile(file, pid, overrideIfNecessary)))
}
