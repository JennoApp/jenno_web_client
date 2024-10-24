import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { env } from '$env/dynamic/private'
import { v4 as uuidv4 } from 'uuid'

const client = new S3Client({
  region: env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: env.AWS_PUBLIC_KEY,
    secretAccessKey: env.AWS_SECRET_KEY,
  }
})

export const uploadFile = async (file: File, type: 'product' | 'profile') => {
  const buffer = await file.arrayBuffer()

  // Generar un UUID para el nombre del archivo
  const fileId = uuidv4()
  const extension = file.name.split('.').pop()

  // Ruta basada en el tipo de imagen
  const folder = type === 'product' ? 'products' : 'profiles'
  const uploadParams = {
    Bucket: env.AWS_BUCKET_NAME,
    Key: `${folder}/${fileId}.${extension}`,
    Body: Buffer.from(buffer)
  }

  const command = new PutObjectCommand(uploadParams)
  const result = await client.send(command)

  console.log(result)

  return { 
    result, 
    publicUrl: `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_BUCKET_REGION}.amazonaws.com/${folder}/${fileId}.${extension}` 
  }
}

