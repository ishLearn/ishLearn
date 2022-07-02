import { Ref, ref } from 'vue'

export default function () {
  const files: Ref<UploadableFile[]> = ref([])
  function addFiles(newFiles: File[]) {
    const newUploadableFiles = [...newFiles]
      .map((file) => new UploadableFile(file))
      .filter((file) => !fileExists(file.id))
    files.value = files.value.concat(newUploadableFiles)
  }
  function fileExists(otherId: string) {
    return files.value.some(({ id }) => id === otherId)
  }
  function removeFile(file: UploadableFile) {
    const index = files.value.indexOf(file)

    if (index > -1) files.value.splice(index, 1)
  }

  return { files, addFiles, removeFile }
}

type UploadStatus = null | 'loading' | true | false

export class UploadableFile {
  file: File
  id: string
  url: string
  status: UploadStatus

  constructor(file: File) {
    this.file = file
    this.id = `${file.name}-${file.size}-${file.lastModified}-${file.type}`
    this.url = URL.createObjectURL(file)
    this.status = null
  }
}
