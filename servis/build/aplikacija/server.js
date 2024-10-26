import express from "express";
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const server = express();
server.get("/dokumentacija", (zahtjev, odgovor) => {
    odgovor.sendFile(path.join(__dirname, "../../dokumentacija/dokumentacija.html"));
});
server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
