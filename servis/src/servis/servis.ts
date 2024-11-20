import express from "express";
import { __filename, __dirname, dajPortSevis } from "../moduli/okolinaUtils.js";
import { Konfiguracija } from "../moduli/upravljateljKonfiguracije.js";
import { RestKorisnik } from "./rest/RESTkorisnik.js";

let port = 3000;
const konfiguracija = new Konfiguracija();
const server = express();
const restKorisnik = new RestKorisnik();
let provjera: Boolean = false;

try {
    server.use(express.json());
    server.use(express.urlencoded({ extended: true }));

    await konfiguracija.ucitajKonfiguraciju();
    console.log("Konfiguracija učitana i provjerena.");

    if (process.argv[3] && process.argv[3] !== "") {
        port = parseInt(process.argv[3]);
        provjera = true;
    } else {
        port = dajPortSevis("mgrabovac22");
    }

    //Default
    server.get("/", (req, res) => {res.send("Hello world!")});

    //Endpointi za korisnika
    server.post("/servis/korisnici", (req, res) => restKorisnik.postKorisnici(req, res));
    server.delete("/servis/korisnici/:korime", (req, res) => restKorisnik.deleteKorisnik(req, res));
    server.get("/servis/korisnici", (req, res) => restKorisnik.getKorisnici(req, res));
    server.put("/servis/korisnici/:korime", (req, res) => restKorisnik.putKorisnici(req, res));

    //Endpointi za bazu servisa - TODo

    server.listen(port, () => {
        const baseURL = provjera || port === 12223 ? "http://localhost" : "http://spider.foi.hr";
        console.log(`Server je pokrenut na ${baseURL}:${port}`);
    });
} catch (error) {
    console.error("Greška pri pokretanju servera: ", error);
    process.exit(1);
}
