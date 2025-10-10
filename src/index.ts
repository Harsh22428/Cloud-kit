import express from 'express';
import cors from "cors";
import generate from './utils'
import simpleGit from 'simple-git';
import path from 'path';
import { getAllFiles } from './file';

const app = express();
app.use(cors());

app.use(express.json());

app.post('/deploy', async (req, res) => {
    const repourl = req.body.repourl;
    const id = generate();
    await simpleGit().clone(repourl, path.join(__dirname, `output/${id}`))


    const files = getAllFiles(path.join(__dirname, `output/${id}`));
    console.log(files)

    // put this into s3
    res.json({
        id: id
    })
})

app.listen(3000, () => {
    console.log("app is listenning at port 3000")
})