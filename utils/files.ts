import fs from 'fs'
// TODO: Axios and Async used here, potentially to uninstall if other system is put in place.
import axios from 'axios'
import async from 'async'

const oneDriveClientID = process.env.ONE_DRIVE_CLIENT_ID
const oneDriveRedirectURI = process.env.ONE_DRIVE_REDIRECT_URI
const oneDriveClientSecret = process.env.ONE_DRIVE_CLIENT_SECRET
const oneDriveRefreshToken = process.env.ONE_DRIVE_REFRESH_TOKEN

async function resUpload(
  filePath: string,
  oneDriveFolder: string,
  oneDriveFilename: string
) {
  const response = await axios.post(
    'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    {
      client_id: oneDriveClientID,
      redirect_uri: oneDriveRedirectURI,
      client_secret: oneDriveClientSecret,
      grant_type: 'refresh_token',
      refresh_token: oneDriveRefreshToken,
    }
  )

  // Here, it creates the session.
  const body: { access_token: string } = response.data
  const res2 = await axios.post(
    `https://graph.microsoft.com/v1.0/drive/root:/${oneDriveFolder}/${oneDriveFilename}:/createUploadSession`,
    {
      item: {
        '@microsoft.graph.conflictBehavior': 'rename',
        name: oneDriveFilename,
      },
    },
    {
      headers: {
        Authorization: 'Bearer ' + body.access_token,
        'Content-Type': 'application/json',
      },
    }
  )

  await uploadFile(res2.data.uploadUrl || res2.data.upload_url, filePath) // TODO: Check which upload url is returned from OneDrive API
}

async function uploadFile(uploadUrl: string, filePath: string) {
  // Here, it uploads the file by every chunk.
  return await async.eachSeries(getParams(filePath), (st, callback) => {
    setTimeout(() => {
      fs.readFile(filePath, async function read(e, f) {
        const res = await axios.put(
          uploadUrl,
          f.slice(st.bstart, st.bend + 1),
          {
            headers: {
              'Content-Length': st.clen,
              'Content-Range': st.cr,
            },
          }
        )

        console.log(res.data)
        return res.data
      })
    }, st.stime)
  })
}

function getParams(filePath: string) {
  const allsize = fs.statSync(filePath).size
  const sep = allsize < 60 * 1024 * 1024 ? allsize : 60 * 1024 * 1024 - 1
  const ar = []
  for (let i = 0; i < allsize; i += sep) {
    const bstart = i
    const bend = i + sep - 1 < allsize ? i + sep - 1 : allsize - 1
    const cr = 'bytes ' + bstart + '-' + bend + '/' + allsize
    const clen = bend != allsize - 1 ? sep : allsize - i
    const stime = allsize < 60 * 1024 * 1024 ? 5000 : 10000
    ar.push({
      bstart: bstart,
      bend: bend,
      cr: cr,
      clen: clen,
      stime: stime,
    })
  }
  return ar
}

const file = '/home/sebas/ishLearn/smalltest/test.txt' // File path you want to upload.
const oneDriveFolder = 'ishLearn/test' // Folder on OneDrive
const oneDriveFilename = 'TestFile.txt' // If you want to change the filename on OneDrive, please set this.
resUpload(file, oneDriveFolder, oneDriveFilename)
