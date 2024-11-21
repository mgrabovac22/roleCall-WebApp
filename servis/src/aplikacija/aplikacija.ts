import express from "express";
import path from "path";
import { __dirname, dajPort, dajPortServis } from "../moduli/okolinaUtils.js";
import { Konfiguracija } from "../moduli/upravljateljKonfiguracije.js";

let port: number;
let portServis: number;
let provjeraPorta: boolean = false;
const konfiguracija = new Konfiguracija();
const server = express();

try {
    server.use(express.json());

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

    server.get("/", (zahtjev, odgovor) => {
        odgovor.sendFile(path.join(__dirname(), "./html/index.html"));
    });

    server.get("/login", (zahtjev, odgovor) => {
        odgovor.sendFile(path.join(__dirname(), "./html/login.html"));
    });

    server.get("/registracija", (zahtjev, odgovor) => {
        odgovor.sendFile(path.join(__dirname(), "./html/registracija.html"));
    });

    server.get("/dodavanje", (zahtjev, odgovor) => {
        odgovor.sendFile(path.join(__dirname(), "./html/dodavanje.html"));
    });

    server.get("/detalji", (zahtjev, odgovor) => {
        odgovor.sendFile(path.join(__dirname(), "./html/detalji.html"));
    });

    server.get("/korisnici", (zahtjev, odgovor) => {
        odgovor.sendFile(path.join(__dirname(), "./html/korisnici.html"));
    });

    server.get("/osobe", (zahtjev, odgovor) => {
        odgovor.sendFile(path.join(__dirname(), "./html/osobe.html"));
    });

    server.get("/dokumentacija", (zahtjev, odgovor) => {
        odgovor.sendFile(path.join(__dirname(), "../../dokumentacija/dokumentacija.html"));
    });

    server.use("/css", express.static(path.join(__dirname(), "./css")));
    server.use("/slike", express.static(path.join(__dirname(), "./resursi/slike")));
    server.use("/dok", express.static(path.join(__dirname(), "../../dokumentacija")));

    server.listen(port, () => {
        if (provjeraPorta) {
            console.log(`Server je pokrenut na http://localhost:${port}`);
        } else {
            console.log(`Server je pokrenut na http://spider.foi.hr:${port}`);
        }
    });
} catch (error) {
    console.error("Greska pri pokretanju servera: ", error);
    process.exit(1);
}
