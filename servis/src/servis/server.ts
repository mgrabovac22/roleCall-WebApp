import express from "express";
/*import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);*/

const server = express();
server.use(express.json());

let fun = function(zahtjev:express.Request, odgovor:express.Response){
    odgovor.send('Hello world!');
  };
server.get('/', fun);

server.listen(12000, () => {
    console.log("Server is running on http://localhost:12000");
});
