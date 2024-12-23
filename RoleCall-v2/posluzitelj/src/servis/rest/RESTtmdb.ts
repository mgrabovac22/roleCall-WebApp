import { Request, Response } from "express";
import { Konfiguracija } from "../../moduli/upravljateljKonfiguracije.js";

export class RestTMDB {
    async getOsobe(req: Request, res: Response) {
        if(req.session.tip_korisnika!==2){
            res.status(401).json({ greska: "Nemate pristup toj metodi!"});
            return;
        }
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

    async getFilmoveOsobeOd21(req: Request, res: Response) {
        const id = parseInt(req.params["id"] as string);
        const stranica = parseInt(req.query["stranica"] as string) || 2; 
        const poStranici = 20; 
        const konfiguracija = new Konfiguracija();
        await konfiguracija.ucitajKonfiguraciju();
        const apiKey = konfiguracija.dajKonf().tmdbApiKeyV3;
    
        if (!id || stranica < 2) { 
            res.status(400).json({ greska: "Nevažeći parametri. Stranica mora biti 2 ili veća." });
            return;
        }
    
        try {
            const filmoviResponse = await fetch(
                `https://api.themoviedb.org/3/person/${id}/movie_credits?api_key=${apiKey}&language=hr-HR`
            );
            if (!filmoviResponse.ok) {
                res.status(filmoviResponse.status).json({ greska: "Greška prilikom dohvaćanja filmova osobe." });
                return;
            }
    
            const filmovi = await filmoviResponse.json();
    
            const pocetak = (stranica - 1) * poStranici;
            const kraj = pocetak + poStranici;
            const filmoviZaSlanje = filmovi.cast.slice(pocetak, kraj);
    
            res.status(200).json({
                ukupno: filmovi.cast.length,
                trenutnaStranica: stranica,
                filmovi: filmoviZaSlanje,
            });
        } catch (err) {
            console.error("Greška prilikom dohvaćanja filmova osobe:", err);
            res.status(500).json({ greska: "Interna greška servera." });
        }
    }    
}
