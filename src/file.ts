import { response } from 'express';
import fs from 'fs';
import path from 'path';

 export const getAllFiles=(directoryPath:string)=>{
    

    let response:string[]=[];

        const allFilesAndFolders=fs.readdirSync(directoryPath);
        allFilesAndFolders.forEach(file=>{
            const fullFilePath=path.join(directoryPath,file)
            if(fs.statSync(fullFilePath).isDirectory()){
                //  /users/hp/vecel/dist/output/1sw345/src/assets
                response=response.concat(getAllFiles(fullFilePath))
                // repsonse=[file.txt,['assests/files.tsxt']]
            }
            else{
                response.push(fullFilePath)
            }
        })
        return response;
           
}

