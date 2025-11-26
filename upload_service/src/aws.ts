import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { readFile } from "node:fs/promises";
import generate from './utils'
import fs from "fs";
// const s3 = new S3Client({
//     region: "auto",
//     credentials: {
//         accessKeyId: "1520335557fb6dfdd2ea44e0822aa001",
//         secretAccessKey: "be8e8947d01c617b2a025a3812c80883248151ac42cbcb7f2d9394d5b4501dfa",
//     },
//     endpoint: "https://e14b54367b12d91bc13b2d6d3e4dc94b.r2.cloudflarestorage.com"
// })

const Id=generate();
export const uploadFile = async (fileName: string, localFilePath: string) => {
    const s3 = new S3Client({
        region: "auto",
        credentials: {
            accessKeyId: "1520335557fb6dfdd2ea44e0822aa001",
            secretAccessKey: "be8e8947d01c617b2a025a3812c80883248151ac42cbcb7f2d9394d5b4501dfa",
        },
        endpoint: "https://e14b54367b12d91bc13b2d6d3e4dc94b.r2.cloudflarestorage.com"
    })
    const remoteKey=`output/${fileName}`
    const fileContent =  fs.readFileSync(localFilePath);
    const command = new PutObjectCommand({
        Bucket: "vercel",
        Body: fileContent,
        Key:remoteKey,
    })
    const response = await s3.send(command);
    console.log(response);
}