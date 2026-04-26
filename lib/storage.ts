import { Storage } from '@google-cloud/storage'

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  keyFilename: process.env.GCS_KEY_FILE || '/root/gcs-credentials.json',
})

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!)

export async function uploadImage(
  file: Buffer,
  filename: string,
  mimetype: string
): Promise<string> {
  const uniqueName = `produtos/${Date.now()}-${filename}`
  const blob = bucket.file(uniqueName)

  await blob.save(file, {
    contentType: mimetype,
  })

  return `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${uniqueName}`
}