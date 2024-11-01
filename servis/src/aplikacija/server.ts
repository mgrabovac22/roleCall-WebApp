import express from "express";
import path from 'path';
import { __filename, __dirname, dajPort } from '../moduli/okolinaUtils.js';
import { Konfiguracija } from "../moduli/upravljateljKonfiguracije.js";

const port = dajPort("mgrabovac22");
const konfiguracija = new Konfiguracija();
const server = express();

try {
    server.use(express.json());

    await konfiguracija.ucitajKonfiguraciju();
	console.log("Konfiguracija učitana i provjerena.");


    server.get("/dokumentacija", (zahtjev, odgovor) => {
        odgovor.sendFile(path.join(__dirname(), "../../dokumentacija/dokumentacija.html"));
    });
    server.use("/css", express.static(path.join(__dirname(), "./css")));
    
    server.listen(port, () => {
        if (port == 12222) { 
            console.log("Server je pokrenut na http://localhost:" + port);
        }
        else{
            console.log("Server je pokrenut na http://spider.foi.hr:" + port);
        }
    });
} catch (error) {
    console.error("Greska pri pokretanju server: ", error);
    process.exit(1);
}


