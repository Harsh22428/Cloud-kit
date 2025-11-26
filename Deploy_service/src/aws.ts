import { S3Client, ListObjectsV2Command, GetObjectAttributesCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import * as fs from "fs";
import * as path from "path";
import { pipeline } from "stream";
import { promisify } from 'util';
const streamPipeline = promisify(pipeline)

const s3 = new S3Client({
    region: "auto",
    credentials: {
        accessKeyId: "1520335557fb6dfdd2ea44e0822aa001",
        secretAccessKey: "be8e8947d01c617b2a025a3812c80883248151ac42cbcb7f2d9394d5b4501dfa",
    },
    endpoint: "https://e14b54367b12d91bc13b2d6d3e4dc94b.r2.cloudflarestorage.com"
})

// output/asdba

export async function downloadS3Folder(prefix: string) {
    const allFiles = await s3.send(
        new ListObjectsV2Command({
            Bucket: 'vercel',
            Prefix: prefix
        })
    )
    const objects = allFiles.Contents ?? []
    const allPromises = objects.map(async ({ Key }) => {
        return new Promise(async (resolve) => {
            if (!Key) {
                resolve("");
                return;
            }
            const finalOutputPath = path.join(__dirname, Key)
            // const outputFile = fs.createWriteStream(finalOutputPath);
            const dirName = path.dirname(finalOutputPath);
            if (!fs.existsSync(dirName)) {
                fs.mkdirSync(dirName, { recursive: true })
            }
            const { Body } = await s3.send(
                new GetObjectCommand({
                    Bucket: 'vercel',
                    Key,
                })
            )
             const outputFile = fs.createWriteStream(finalOutputPath);
            await streamPipeline(Body as any, outputFile)
            console.log("Downloaded:", Key)
        })
    })
    await Promise.all(allPromises);
    console.log("all downloads completed")
}