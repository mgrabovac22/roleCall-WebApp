import express from "express";
import { __filename, __dirname, dajPortServis } from "../moduli/okolinaUtils.js";
import { Konfiguracija } from "../moduli/upravljateljKonfiguracije.js";
import { metodaNijeImplementirana } from "./errors/notImplemented.js";
import { RestKorisnik } from "./rest/RESTkorisnik.js";
import { RestOsoba } from "./rest/RESTosoba.js";
import { RestFilm } from "./rest/RESTfilm.js";
import session from "express-session";
import cors from "cors";
import { provjeriToken } from "../moduli/jwtModul.js";
import { RestTMDB } from "./rest/RESTtmdb.js";
import { kreirajToken } from "../moduli/jwtModul.js";

let port = 3000;
const konfiguracija = new Konfiguracija();
const server = express();
let provjera: Boolean = false;

declare module 'express-session' {
    export interface SessionData {
        korime: string;
        status: string;
        tip_korisnika: number;
    }
}

try {
    server.use(cors({
        origin: ['http://localhost:4200', 'http://localhost:12222']
    }));
    
    
    server.use(express.json());
    server.use(express.urlencoded({ extended: true }));
    
    await konfiguracija.ucitajKonfiguraciju();
    console.log("Konfiguracija učitana i provjerena.");
    
    if (process.argv[3] && process.argv[3] !== "") {
        port = parseInt(process.argv[3]);
        provjera = true;
    } 
    else {
        port = dajPortServis("mgrabovac22");
    }
    if(process.argv.length>4){        
        throw new Error("Previše argumenata naredbenog retka!");
    }

    const restKorisnik = new RestKorisnik();
    const restOsoba = new RestOsoba(port);
    const restFilm = new RestFilm();
    const restTMDB = new RestTMDB();
    
    server.use(
        session({
            secret: konfiguracija.dajKonf().tajniKljucSesija,
            resave: false,
            saveUninitialized: false,
            cookie: { secure: false },
        })
    );
    
    //TODO: nakon logina, postaviti da se korime uzima iz sesije
    server.get("/servis/app/getJWT", (req, res) => {
        req.session.korime = "Marin";
        if(req.session.korime!=null){
            const korime = req.session.korime;
            const token = kreirajToken({ korime: korime }, konfiguracija.dajKonf().jwtTajniKljuc);
            res.status(200).json({ token: `Bearer ${token}` });
        }
        else{
            res.status(401).json({greska: "Nije kreirana sesija"});
        }
    });    


    server.all("*", (zahtjev, odgovor, dalje) => {
        try {    
            const tokenValidan = provjeriToken(zahtjev, konfiguracija.dajKonf().jwtTajniKljuc);
    
            if (!tokenValidan) {
                odgovor.status(406).json({ greska: "Nevažeći token" }); 
                return;
            }
    
            dalje(); 
        } catch (err) {
            odgovor.status(422).json({ greska: "Token je istekao." }); 
        }
    });
    

    server.post("/servis/korisnici", (req, res) => restKorisnik.postKorisnici(req, res));
    server.get("/servis/korisnici", metodaNijeImplementirana);
    server.put("/servis/korisnici", metodaNijeImplementirana); 
    server.delete("/servis/korisnici", metodaNijeImplementirana);

    server.post("/servis/korisnici/:korime", metodaNijeImplementirana);
    server.put("/servis/korisnici/:korime", metodaNijeImplementirana);
    server.delete("/servis/korisnici/:korime", (req, res) => restKorisnik.deleteKorisnik(req, res));
    server.get("/servis/korisnici/:korime", metodaNijeImplementirana); 

    server.post("/servis/osoba", (req, res) => restOsoba.postOsoba(req, res));
    server.get("/servis/osoba", (req, res) => restOsoba.getOsobePoStranici(req, res));
    server.put("/servis/osoba", metodaNijeImplementirana); 
    server.delete("/servis/osoba", metodaNijeImplementirana); 

    server.post("/servis/osoba/:id", metodaNijeImplementirana);
    server.get("/servis/osoba/:id", (req, res) => restOsoba.getOsoba(req, res));
    server.put("/servis/osoba/:id", metodaNijeImplementirana); 
    server.delete("/servis/osoba/:id", (req, res) => restOsoba.deleteOsoba(req, res));

    server.get("/servis/film", (req, res) => restFilm.getFilmove(req, res));
    server.post("/servis/film", (req, res) => restFilm.postFilm(req, res));
    server.put("/servis/film", metodaNijeImplementirana);
    server.delete("/servis/film", metodaNijeImplementirana);

    server.post("/servis/film/:id", metodaNijeImplementirana);
    server.get("/servis/film/:id", (req, res) => restFilm.getFilm(req, res));
    server.put("/servis/film/:id", metodaNijeImplementirana); 
    server.delete("/servis/film/:id", (req, res) => restFilm.deleteFilm(req, res));

    server.post("/servis/osoba/:id/film", metodaNijeImplementirana); 
    server.get("/servis/osoba/:id/film", (req, res) => restOsoba.getFilmoveOsobe(req, res));
    server.put("/servis/osoba/:id/film", (req, res) => restOsoba.poveziOsobuFilmove(req, res));
    server.delete("/servis/osoba/:id/film", (req, res) => restOsoba.obrisiVezeOsobaFilmove(req, res));

    server.get("/servis/app/pretrazi", (req, res) => restTMDB.getOsobe(req, res));
    server.get("/servis/app/:id/filmoviTmdb", (req, res) => restTMDB.getFilmoveOsobeOd21(req, res));
    server.get("/servis/app/provjeriPostojanje/:id", (req, res) => restOsoba.provjeriPostojanjeOsobe(req, res));
    server.post("/servis/app/osobaFilmovi", (req, res) => restOsoba.dodajOsobuFilmove(req, res));
    server.delete("/servis/app/osobaFilmovi/:id", (req, res) => restOsoba.obrisiOsobuFilmove(req, res));

    server.listen(port, () => {
        const baseURL = provjera || port === 12222 ? "http://localhost" : "http://spider.foi.hr";
        console.log(`Server je pokrenut na ${baseURL}:${port}`);
    });
    
    server.use((req, res) => {
        res.status(404).json({ greska: "nepostojeći resurs" });
    });
    
} catch (error) {
    console.error("Greška pri pokretanju servera: ", error);
    process.exit(1);
}
