import { Storage } from '@google-cloud/storage'

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
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
    public: true,
  })

  return `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${uniqueName}`
}