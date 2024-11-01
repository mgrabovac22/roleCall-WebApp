import express from "express";
import { __filename, __dirname, dajPortSevis } from '../moduli/okolinaUtils.js';
import { Konfiguracija } from "../moduli/upravljateljKonfiguracije.js";

const port = dajPortSevis("mgrabovac22");
const konfiguracija = new Konfiguracija();
const server = express();

try {
    server.use(express.json());

    await konfiguracija.ucitajKonfiguraciju();
	console.log("Konfiguracija učitana i provjerena.");


    let fun = function(zahtjev:express.Request, odgovor:express.Response){
        odgovor.send('Hello world!');
      };

    server.get('/', fun);
    
    server.listen(port, () => {
        if (port == 12223) { 
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


