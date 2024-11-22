import express, { Request, Response } from "express";
import { Konfiguracija } from "../../moduli/upravljateljKonfiguracije.js";

const server = express();
server.use(express.json());

export class Middleware {
    portServis: number;

    constructor(portServis: number) {
        this.portServis = portServis;
    }

    async postOsoba(req: Request, res: Response): Promise<void> {
        try {
            const { id, ime_prezime, izvor_poznatosti, putanja_profila, rang_popularnosti } = req.body;

            if (!id || !ime_prezime || !izvor_poznatosti) {
                res.status(400).json({ greska: "Nedostaju obavezni podaci za dodavanje osobe." });
                return;
            }

            const url = `http://localhost:${this.portServis}/servis/osoba`;
            const body = JSON.stringify({
                id,
                ime_prezime,
                izvor_poznatosti,
                putanja_profila,
                rang_popularnosti,
            });

            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body,
            };

            const odgovor = await fetch(url, options);

            if (odgovor.ok) {
                const responseData = await odgovor.json();
                res.status(201).json({ poruka: responseData.poruka || "Osoba uspješno dodana na server." });
            } else {
                const greska = await odgovor.json();
                res.status(odgovor.status).json({ greska: greska.greska || "Greška prilikom poziva drugog servera." });
            }
        } catch (error) {
            console.error("Greška u middleware endpointu:", error);
            res.status(500).json({ greska: "Došlo je do greške u posredniku." });
        }
    }

    async deleteOsoba(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({ greska: "ID osobe je obavezan za brisanje." });
                return;
            }

            const url = `http://localhost:${this.portServis}/servis/osoba/${id}`;

            const options = {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            };

            const odgovor = await fetch(url, options);

            if (odgovor.ok) {
                const responseData = await odgovor.json();
                res.status(200).json({ poruka: responseData.poruka || "Osoba uspješno obrisana sa servera." });
            } else {
                const greska = await odgovor.json();
                res.status(odgovor.status).json({ greska: greska.greska || "Greška prilikom poziva drugog servera za brisanje." });
            }
        } catch (error) {
            console.error("Greška u middleware endpointu za brisanje osobe:", error);
            res.status(500).json({ greska: "Došlo je do greške u posredniku za brisanje." });
        }
    }

    async getApiKey(req: Request, res: Response): Promise<void> {
        try {
            const konfiguracija = new Konfiguracija();
            let konf = konfiguracija.dajKonf();
            const apiKey = konf.tmdbApiKeyV3;

            if (!apiKey) {
                res.status(500).json({ error: "API key not found." });
                return;
            }

            res.status(200).json({ apiKey });
        } catch (error) {
            console.error("Error fetching API key:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    }
    
}
