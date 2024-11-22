import express, { Request, Response } from "express";

const server = express();
server.use(express.json());

export class SlojZaPristupServisu {
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

    async provjeriPostojanjeOsobe(zahtjev: Request, odgovor: Response) {
        odgovor.type("application/json");

        const id = parseInt(zahtjev.params["id"] as string);
        if (isNaN(id) || id <= 0) {
            odgovor.status(400).json({ greska: "Nevažeći ID osobe" });
            return;
        }

        const vanjskiServisUrl = `http://localhost:`+ this.portServis +`/servis/osoba/${id}`;

        try {
            const vanjskiOdgovor = await fetch(vanjskiServisUrl, { method: "GET" });

            if (vanjskiOdgovor.status === 200) {
                odgovor.status(200).json({ poruka: "Osoba postoji u bazi" });
            } else if (vanjskiOdgovor.status === 404) {
                odgovor.status(404).json({ poruka: "Osoba nije pronađena u bazi" });
            } else {
                throw new Error(`Neočekivani status: ${vanjskiOdgovor.status}`);
            }
        } catch (error) {
            console.error("Greška prilikom poziva vanjskog servisa:", error);
            odgovor.status(500).json({ greska: "Greška prilikom provjere postojanja osobe" });
        }
    }
    
    
}
