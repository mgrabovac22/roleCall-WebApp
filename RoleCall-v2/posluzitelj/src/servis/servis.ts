import express from "express";
import { __filename, __dirname, dajPortServis } from "../moduli/okolinaUtils.js";
import { Konfiguracija } from "../moduli/upravljateljKonfiguracije.js";
import { metodaNijeImplementirana } from "./errors/notImplemented.js";
import { RestKorisnik } from "./rest/RESTkorisnik.js";
import { RestOsoba } from "./rest/RESTosoba.js";
import { RestFilm } from "./rest/RESTfilm.js";
import session from "express-session";
import cors from "cors";
import { RestTMDB } from "./rest/RESTtmdb.js";
import { jwtMiddleware, kreirajToken } from "../moduli/jwtModul.js";
import { RestAuthKorisnik } from "./rest/RESTkorisnikAuth.js";
import path from "path";

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
        origin: ['http://localhost:4200', 'http://localhost:12222'],
        credentials: true
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
    const restAuthKorisnik = new RestAuthKorisnik();
    
    
    server.use(
        session({
            secret: konfiguracija.dajKonf().tajniKljucSesija,
            resave: false,
            saveUninitialized: false,
            cookie: { secure: false, httpOnly: true, sameSite: 'lax' },
        })
    );

    server.use(express.static(path.join(__dirname(), '../../angular/role-call/browser'))); 
    
    server.get("/servis/app/getJWT", (req, res) => {
        
        if(req.session.korime!=null){
            const korime = req.session.korime;
            const token = kreirajToken({ korime: korime }, konfiguracija.dajKonf().jwtTajniKljuc);
            res.status(200).json({ token: `Bearer ${token}` });
        }
        else{
            res.status(401).json({greska: "Nije kreirana sesija"});
        }
    });  
    
    server.get("/servis/app/getSesija", (req, res) => {
        if (req.session) {
            res.status(200).json({ session: req.session });
        } else {
            res.status(401).json({ error: "Sesija nije aktivna ili ne postoji." });
        }
    });
    
    server.get("/servis/app/odjava", (req, res) => {
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    console.error("Greška prilikom uništavanja sesije:", err);
                    res.status(500).json({ greska: "Neuspješno odjavljivanje." });
                } else {
                    res.clearCookie("connect.sid"); 
                    res.status(201).json({status: "uspjeh"}); 
                }
            });
        } else {
            res.status(404).json({greska: "nije pronadjena sesija"});
        }
    });
    
    server.post("/servis/app/korisnici/prijava", (req, res) => restAuthKorisnik.prijavaKorisnika(req, res));
    server.post("/servis/app/korisnici", (req, res) => restAuthKorisnik.postKorisnik(req, res));
    
    server.post("/servis/korisnici",jwtMiddleware(), (req, res) => restKorisnik.postKorisnici(req, res));
    server.get("/servis/korisnici",jwtMiddleware(), metodaNijeImplementirana);
    server.put("/servis/korisnici",jwtMiddleware(), metodaNijeImplementirana); 
    server.delete("/servis/korisnici",jwtMiddleware(), metodaNijeImplementirana);
    
    server.post("/servis/korisnici/:korime",jwtMiddleware(), metodaNijeImplementirana);
    server.put("/servis/korisnici/:korime",jwtMiddleware(), metodaNijeImplementirana);
    server.delete("/servis/korisnici/:korime",jwtMiddleware(), (req, res) => restKorisnik.deleteKorisnik(req, res));
    server.get("/servis/korisnici/:korime",jwtMiddleware(), metodaNijeImplementirana); 
    
    server.post("/servis/osoba",jwtMiddleware(), (req, res) => restOsoba.postOsoba(req, res));
    server.get("/servis/osoba",jwtMiddleware(), (req, res) => restOsoba.getOsobePoStranici(req, res));
    server.put("/servis/osoba",jwtMiddleware(), metodaNijeImplementirana); 
    server.delete("/servis/osoba",jwtMiddleware(), metodaNijeImplementirana); 
    
    server.post("/servis/osoba/:id",jwtMiddleware(), metodaNijeImplementirana);
    server.get("/servis/osoba/:id",jwtMiddleware(), (req, res) => restOsoba.getOsoba(req, res));
    server.put("/servis/osoba/:id",jwtMiddleware(), metodaNijeImplementirana); 
    server.delete("/servis/osoba/:id",jwtMiddleware(), (req, res) => restOsoba.deleteOsoba(req, res));
    
    server.get("/servis/film",jwtMiddleware(), (req, res) => restFilm.getFilmove(req, res));
    server.post("/servis/film",jwtMiddleware(), (req, res) => restFilm.postFilm(req, res));
    server.put("/servis/film",jwtMiddleware(), metodaNijeImplementirana);
    server.delete("/servis/film",jwtMiddleware(), metodaNijeImplementirana);
    
    server.post("/servis/film/:id",jwtMiddleware(), metodaNijeImplementirana);
    server.get("/servis/film/:id",jwtMiddleware(), (req, res) => restFilm.getFilm(req, res));
    server.put("/servis/film/:id",jwtMiddleware(), metodaNijeImplementirana); 
    server.delete("/servis/film/:id",jwtMiddleware(), (req, res) => restFilm.deleteFilm(req, res));
    
    server.post("/servis/osoba/:id/film",jwtMiddleware(), metodaNijeImplementirana); 
    server.get("/servis/osoba/:id/film",jwtMiddleware(), (req, res) => restOsoba.getFilmoveOsobe(req, res));
    server.put("/servis/osoba/:id/film",jwtMiddleware(), (req, res) => restOsoba.poveziOsobuFilmove(req, res));
    server.delete("/servis/osoba/:id/film",jwtMiddleware(), (req, res) => restOsoba.obrisiVezeOsobaFilmove(req, res));
    
    server.get("/servis/app/pretrazi",jwtMiddleware(), (req, res) => restTMDB.getOsobe(req, res));
    server.get("/servis/app/:id/filmoviTmdb",jwtMiddleware(), (req, res) => restTMDB.getFilmoveOsobeOd21(req, res));
    server.get("/servis/app/provjeriPostojanje/:id",jwtMiddleware(), (req, res) => restOsoba.provjeriPostojanjeOsobe(req, res));
    server.post("/servis/app/osobaFilmovi",jwtMiddleware(), (req, res) => restOsoba.dodajOsobuFilmove(req, res));
    server.delete("/servis/app/osobaFilmovi/:id",jwtMiddleware(), (req, res) => restOsoba.obrisiOsobuFilmove(req, res));
    
    server.get("/servis/app/korisnici",jwtMiddleware(), (req, res) => restAuthKorisnik.getKorisnici(req, res));
    server.get("/servis/app/korisnici/tipovi",jwtMiddleware(), (req, res) => restAuthKorisnik.getTipoviKorisnika(req, res));
    server.put("/servis/app/korisnici/:id/dajPristup",jwtMiddleware(), (req, res) => restAuthKorisnik.dajPristup(req, res));
    server.put("/servis/app/korisnici/:id/zabraniPristup",jwtMiddleware(), (req, res) => restAuthKorisnik.zabraniPristup(req, res));
    server.post("/servis/app/korisnici/posaljiZahtjev",jwtMiddleware(), (req, res) => restAuthKorisnik.postZahtjevAdminu(req, res));
    server.get("/servis/app/korisnici/dajTrenutnogKorisnika",jwtMiddleware(), (req, res) => restAuthKorisnik.dohvatiTrenutnogKorisnika(req, res));
    server.get("/servis/app/korisnici/:id",jwtMiddleware(), (req, res) => restAuthKorisnik.getKorisnik(req, res));
    server.delete("/servis/app/korisnici/:id/obrisi",jwtMiddleware(), (req, res) => restAuthKorisnik.deleteKorisnik(req, res));
    
    server.get('*', (req, res) => {
        res.sendFile(path.join(__dirname(), '../../angular/role-call/browser/index.html')); 
    });
    
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
