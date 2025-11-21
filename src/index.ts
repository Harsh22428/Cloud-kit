// account id - 1520335557fb6dfdd2ea44e0822aa001
// secretkey - be8e8947d01c617b2a025a3812c80883248151ac42cbcb7f2d9394d5b4501dfa
// endpoint - https://e14b54367b12d91bc13b2d6d3e4dc94b.r2.cloudflarestorage.com

import express from 'express';
import cors from "cors";
import generate from './utils'
import simpleGit from 'simple-git';
import path from 'path';
import { getAllFiles } from './file';
import { uploadFile } from './aws';


const app = express();
app.use(cors());

app.use(express.json());

app.post('/deploy', async (req, res) => {
    const repourl = req.body.repourl;
    const id = generate();
    await simpleGit().clone(repourl, path.join(__dirname, `output/${id}`))


    const files = getAllFiles(path.join(__dirname, `output/${id}`));
    files.forEach(async file=>{
        
        // file= c/user/hp/vercel/dist/output/1234dgt/app.tsx 
        // __dirname.length= c/user/hp/vercel/dist
        // __dirname.length +1 = c/user/hp/vercel/dist/
      
        await uploadFile(file.slice(__dirname.length+1),file)
    })
    // console.log(files)

    // put this into s3
    res.json({
        id: id
    })
})

app.listen(3000, () => {
    console.log("app is listenning at port 3000")
})