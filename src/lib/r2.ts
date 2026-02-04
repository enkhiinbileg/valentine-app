import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT || "",
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
})

export async function getUploadUrl(fileName: string, contentType: string) {
    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
        ContentType: contentType,
    })

    // URL valid for 60 seconds
    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 })
    return url
}
