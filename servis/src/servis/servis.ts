import express from "express";
import { __filename, __dirname, dajPortSevis } from "../moduli/okolinaUtils.js";
import { Konfiguracija } from "../moduli/upravljateljKonfiguracije.js";
import { RestKorisnik } from "./rest/RESTkorisnik.js";
import { RestOsoba } from "./rest/RESTosoba.js";
import { RestFilm } from "./rest/RESTfilm.js";

let port = 3000;
const konfiguracija = new Konfiguracija();
const server = express();
const restKorisnik = new RestKorisnik();
const restOsoba = new RestOsoba();
const restFilm = new RestFilm();
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

    //Endpointi za osobe
    server.post("/servis/osoba", (req, res) => restOsoba.postOsoba(req, res));
    server.delete("/servis/osoba/:id", (req, res) => restOsoba.deleteOsoba(req, res));
    server.get("/servis/osoba", (req, res) => restOsoba.getOsobePoStranici(req, res));
    server.get("/servis/osoba/:id", (req, res) => restOsoba.getOsoba(req, res));
    server.get("/servis/osoba/:id/film", (req, res) => restOsoba.getFilmoveOsobe(req, res));
    server.put("/servis/osoba/:id/film", (req, res) => restOsoba.poveziOsobuFilmove(req, res));
    server.delete("/servis/osoba/:id/film", (req, res) => restOsoba.obrisiVezeOsobaFilmove(req, res));

    //Endpointi za filmove
    server.get("/servis/film", (req, res) => restFilm.getFilmove(req, res));
    server.post("/servis/film", (req, res) => restFilm.postFilm(req, res));
    server.get("/servis/film/:id", (req, res) => restFilm.getFilm(req, res));
    server.delete("/servis/film/:id", (req, res) => restFilm.deleteFilm(req, res));

    //Endpointi za slike
    server.post("/servis/osoba/slika", (req, res) => restOsoba.postSlika(req, res));

    server.listen(port, () => {
        const baseURL = provjera || port === 12223 ? "http://localhost" : "http://spider.foi.hr";
        console.log(`Server je pokrenut na ${baseURL}:${port}`);
    });
} catch (error) {
    console.error("Greška pri pokretanju servera: ", error);
    process.exit(1);
}
