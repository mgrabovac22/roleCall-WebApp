import { Request, Response } from "express";
import { Konfiguracija } from "../../moduli/upravljateljKonfiguracije.js";

export class RestOsoba {
    async getOsobe(req: Request, res: Response) {
        const konfiguracija = new Konfiguracija();
        await konfiguracija.ucitajKonfiguraciju();
        const { query, stranica = 1 } = req.query;
        const apiKey = konfiguracija.dajKonf().tmdbApiKeyV3;
        const url = `https://api.themoviedb.org/3/search/person?include_adult=false&language=en-US&page=${stranica}&query=${encodeURIComponent(query as string)}&api_key=${apiKey}`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Greška prilikom poziva TMDB API-ja: ${response.status}`);
            }

            const data = await response.json();
            res.status(200).json(data);
        } catch (error) {
            console.error("Greška prilikom dohvaćanja osoba s TMDB API-ja:", error);
            res.status(500).json({ greska: "Interna greška servera" });
        }
    }
}
