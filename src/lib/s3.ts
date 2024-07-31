import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { env } from '$env/dynamic/private'

const client = new S3Client({
  region: env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: env.AWS_PUBLIC_KEY,
    secretAccessKey: env.AWS_SECRET_KEY,
  } 
})

export const uploadFile = async (file: File) => {
  const buffer = await file.arrayBuffer()
  const uploadParams = {
    Bucket: env.AWS_BUCKET_NAME,
    Key: file.name,
    Body: Buffer.from(buffer)
  }

  const command = new PutObjectCommand(uploadParams)
  const result = await client.send(command)

  console.log(result)

  return result
}
