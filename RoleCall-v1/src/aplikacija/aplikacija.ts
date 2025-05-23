import express from "express";
import path from "path";
import session from "express-session";
import { __dirname, dajPort, dajPortServis } from "../moduli/okolinaUtils.js";
import { Konfiguracija } from "../moduli/upravljateljKonfiguracije.js";
import { RestKorisnik } from "./dao/servisKlijent.js";
import { SlojZaPristupServisu } from "./tsc/slojZaPristupServisu.js";
import { RestOsoba } from "./tsc/tmdbKlijent.js";
import { NavigacijaServis } from "./tsc/upravljajNavigacija.js";
import cors from "cors";

let port: number;
let portServis: number;
let provjeraPorta: boolean = false;
const konfiguracija = new Konfiguracija();
await konfiguracija.ucitajKonfiguraciju();
let konf = konfiguracija.dajKonf();
const server = express();
const restKorisnik = new RestKorisnik();
const restOsoba = new RestOsoba();
const navigacijaServis = new NavigacijaServis();
server.use(
    session({
        secret: konf.tajniKljucSesija,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
    })
);
declare module 'express-session' {
    export interface SessionData {
        korime: string;
        status: string;
        tip_korisnika: number;
    }
}

try {
    server.use(express.json());
    server.use(cors());
    server.use(express.urlencoded({ extended: true }));

    await konfiguracija.ucitajKonfiguraciju();
    console.log("Konfiguracija učitana i provjerena.");

    if (process.argv[3] && process.argv[3] !== "") {
        portServis = parseInt(process.argv[3]);
    } else {
        portServis = dajPortServis("mgrabovac22");
    }

    if (process.argv[4] && process.argv[4] !== "") {
        port = parseInt(process.argv[4]);
        provjeraPorta = true;
    } else {
        port = dajPort("mgrabovac22");
    }
    
    console.log(`PortServis: ${portServis}`);
    console.log(`Port: ${port}`);

    const slojZaPristupServisu = new SlojZaPristupServisu(portServis);
    
    server.use("/css", express.static(path.join(__dirname(), "./css")));
    server.use("/jsk", express.static(path.join(__dirname(), "./jsk")));
    server.use("/slike", express.static(path.join(__dirname(), "./resursi/slike")));
    server.use("/dok", express.static(path.join(__dirname(), "../../dokumentacija")));
    
    server.post("/servis/korisnici", (req, res) => restKorisnik.postKorisnik(req, res));
    server.post("/servis/prijava", (req, res) => restKorisnik.prijavaKorisnika(req, res));

    server.get("/servis/navigacija", (req, res) => navigacijaServis.getNavigaciju(req, res));
    
    server.get("/dokumentacija", (zahtjev, odgovor) => {
        odgovor.sendFile(path.join(__dirname(), "../../dokumentacija/dokumentacija.html"));
    });
    
    server.get("/login", (zahtjev, odgovor) => {
        odgovor.sendFile(path.join(__dirname(), "./html/login.html"));
    });
    
    server.get("/registracija", (zahtjev, odgovor) => {
        odgovor.sendFile(path.join(__dirname(), "./html/registracija.html"));
    });
    
    server.get("/odjava", (req, res) => {
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    console.error("Greška prilikom uništavanja sesije:", err);
                    res.status(500).json({ greska: "Neuspješno odjavljivanje." });
                } else {
                    res.clearCookie("connect.sid"); 
                    res.redirect("/login"); 
                }
            });
        } else {
            res.redirect("/login"); 
        }
    });
    
    server.all("*", (zahtjev, odgovor, dalje)=>{
        
        if(zahtjev.session.korime == null){
            odgovor.redirect("/login");
            return;
        }else{
            dalje();
        }
    })
    server.get("/servis/korisnici", (req, res) => restKorisnik.getKorisnici(req, res));
    server.get("/servis/tipovi-korisnika", (req, res) => restKorisnik.getTipoviKorisnika(req, res));
    server.put("/servis/korisnici/:id/pristup", (req, res) => restKorisnik.dajPristup(req, res));
    server.put("/servis/korisnici/:id/zabrani-pristup", (req, res) => restKorisnik.zabraniPristup(req, res));
    server.post("/servis/korisnik/zahtjev", (req, res) => restKorisnik.postZahtjevAdminu(req, res));
    server.get("/servis/korisnici/trenutni", (req, res) => restKorisnik.dohvatiTrenutnogKorisnika(req, res));
    server.get("/servis/korisnici/:id", (req, res) => restKorisnik.getKorisnik(req, res));
    server.delete("/servis/korisnici/:id/obrisi", (req, res) => restKorisnik.deleteKorisnik(req, res));
    
    server.post("/servis/dodaj/osoba", (req, res) => slojZaPristupServisu.postOsoba(req, res));
    server.delete("/servis/obrisi/osoba/:id", (req, res) => slojZaPristupServisu.deleteOsoba(req, res));
    server.get("/servis/provjera-postojanja/:id", (req, res) => slojZaPristupServisu.provjeriPostojanjeOsobe(req, res));
    server.get("/servis/osobe/prikaz", (req, res) => slojZaPristupServisu.getOsobe(req, res));
    server.get("/servis/osoba/:id", (req, res) => slojZaPristupServisu.getDetaljeOsobe(req, res));
    server.get("/servis/osoba/:id/film", (req, res) => slojZaPristupServisu.getFilmoveOsobe(req, res));
    server.post("/servis/korisnici/rest", (req, res) => slojZaPristupServisu.dodajKorisnika(req, res));
    server.delete("/servis/korisnici/:korime", (req, res) => slojZaPristupServisu.deleteKorisnik(req, res));
    
    server.get("/servis/osoba/:id/filmOd21", (req, res) => restOsoba.getFilmoveOsobeOd21(req, res));
    server.get("/servis/osobe", (req, res) => restOsoba.getOsobe(req, res));
    
    server.get("/", (zahtjev, odgovor) => {
        
        odgovor.sendFile(path.join(__dirname(), "./html/index.html"));
    });
    
    server.get("/dodavanje", (zahtjev, odgovor) => {
        if(zahtjev.session.tip_korisnika==2){
            odgovor.sendFile(path.join(__dirname(), "./html/dodavanje.html"));
        }
        else{
            odgovor.status(401).sendFile(path.join(__dirname(), "./html/neovlastenPristup.html"));
        }
    });
    
    server.get("/detalji/:id", (zahtjev, odgovor) => {
        if(zahtjev.session.status==="Ima pristup"){
            odgovor.sendFile(path.join(__dirname(), "./html/detalji.html"));
        }
        else{
            odgovor.status(401).sendFile(path.join(__dirname(), "./html/neovlastenPristup.html"));
        }
    });
    
    server.get("/korisnici", (zahtjev, odgovor) => {
        if(zahtjev.session.tip_korisnika==2){
            odgovor.sendFile(path.join(__dirname(), "./html/korisnici.html"));
        }
        else{
            odgovor.status(401).sendFile(path.join(__dirname(), "./html/neovlastenPristup.html"));
        }
    });
    
    server.get("/osobe", (zahtjev, odgovor) => {
        if(zahtjev.session.status==="Ima pristup"){
            odgovor.sendFile(path.join(__dirname(), "./html/osobe.html"));
        }
        else{
            odgovor.status(401).sendFile(path.join(__dirname(), "./html/neovlastenPristup.html"));
        }
    });
    
    server.listen(port, () => {
        if (provjeraPorta || port==12222) {
            console.log(`Server je pokrenut na http://localhost:${port}`);
        } else {
            console.log(`Server je pokrenut na http://spider.foi.hr:${port}`);
        }
    });
} catch (error) {
    console.error("Greska pri pokretanju servera: ", error);
    process.exit(1);
}
