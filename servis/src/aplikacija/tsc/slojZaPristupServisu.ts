import express, { Request, Response } from "express";

const server = express();
server.use(express.json());

export class SlojZaPristupServisu {
    portServis: number;

    constructor(portServis: number) {
        this.portServis = portServis;
    }

    async postOsoba(req: Request, res: Response) {
        const { id, ime_prezime, izvor_poznatosti, putanja_profila, rang_popularnosti } = req.body;
    
        if (!id || !ime_prezime || !izvor_poznatosti) {
            res.status(400).json({ greska: "Nedostaju obavezni podaci za dodavanje osobe." });
            return;
        }
    
        try {
            const tmdbSlikeResponse = await fetch(`https://api.themoviedb.org/3/person/${id}/images?api_key=1280aa15ece9584768dd84dd4aa3d294`);
            if (!tmdbSlikeResponse.ok) {
                const greska = await tmdbSlikeResponse.json();
                res.status(tmdbSlikeResponse.status).json({
                    greska: greska.status_message || "Greška prilikom dohvaćanja slika s TMDB-a.",
                });
                return;
            }
        
            const tmdbSlikeData = await tmdbSlikeResponse.json();
            const slike = tmdbSlikeData.profiles.map((slika: any) => slika.file_path);
        
            const osobaResponse = await fetch(`http://localhost:${this.portServis}/servis/osoba`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id,
                    ime_prezime,
                    izvor_poznatosti,
                    putanja_profila,
                    rang_popularnosti,
                    slike, 
                }),
            });
            
            if(!osobaResponse.ok){
                console.warn(`Osoba nije uspešno dodan.`);
            }
    
            const tmdbFilmoviResponse = await fetch(`https://api.themoviedb.org/3/person/${id}/movie_credits?api_key=1280aa15ece9584768dd84dd4aa3d294`);
            if (!tmdbFilmoviResponse.ok) {
                const greska = await tmdbFilmoviResponse.json();
                res.status(tmdbFilmoviResponse.status).json({
                    greska: greska.status_message || "Greška prilikom dohvaćanja filmova s TMDB-a.",
                });
                return;
            }
    
            const tmdbFilmoviData = await tmdbFilmoviResponse.json();
            const filmovi = tmdbFilmoviData.cast || [];
    
            const filmoviZaDodavanje = filmovi.slice(0, 20); 
    
            for (const film of filmoviZaDodavanje) {
                const filmResponse = await fetch(`http://localhost:${this.portServis}/servis/film`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: film.id,
                        org_naslov: film.original_title,
                        naslov: film.title,
                        jezik: film.original_language,
                        datum_izdavanja: film.release_date,
                    }),
                });
                
                if (!filmResponse.ok) {
                    console.warn(`Film s ID-jem ${film.id} nije uspešno dodan.`);
                    continue;
                }
    
                const poveziFilmResponse = await fetch(`http://localhost:${this.portServis}/servis/osoba/${id}/film`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify([{ film_id: film.id }]),
                });
    
                if (!poveziFilmResponse.ok) {
                    console.warn(`Veza između osobe ${id} i filma ${film.id} nije uspešno dodana.`);
                }
            }
    
            res.status(201).json({ poruka: "Osoba, filmovi i slike uspješno dodani." });
        } catch (error) {
            console.error("Greška prilikom dodavanja osobe s filmovima i slikama:", error);
            res.status(500).json({ greska: "Interna greška servera." });
        }
    }
    

    async deleteOsoba(req: Request, res: Response) {
        try {
            const { id } = req.params;
    
            if (!id) {
                res.status(400).json({ greska: "ID osobe je obavezan za brisanje." });
                return;
            }
    
            console.log(`Brisanje osobe s ID-jem: ${id}`);
    
            const vezeUrl = `http://localhost:${this.portServis}/servis/osoba/${id}/film`;
            const vezeOdgovor = await fetch(vezeUrl, { method: "DELETE", headers: { "Content-Type": "application/json" } });
    
            if (!vezeOdgovor.ok) {
                console.error(`Greška prilikom brisanja veza između osobe i filmova: ${vezeOdgovor.status}`);
                res.status(500).json({ greska: "Greška prilikom brisanja veza između osobe i filmova." });
                return;
            }
    
            console.log(`Veze između osobe ${id} i filmova uspješno obrisane.`);
    
            const osobaUrl = `http://localhost:${this.portServis}/servis/osoba/${id}`;
            const osobaOdgovor = await fetch(osobaUrl, { method: "DELETE", headers: { "Content-Type": "application/json" } });
    
            if (!osobaOdgovor.ok) {
                console.error(`Greška prilikom brisanja osobe: ${osobaOdgovor.status}`);
                res.status(500).json({ greska: "Greška prilikom brisanja osobe." });
                return;
            }
    
            console.log(`Osoba s ID-jem ${id} uspješno obrisana.`);

            const filmoviUrl = `http://localhost:${this.portServis}/servis/film`;
            const filmovi = await fetch(filmoviUrl, { method: "GET" });
            const filmoviJSON = await filmovi.json();
    
            for (const film of filmoviJSON) {
                const filmId = film.id;
            
                if (!filmId) {
                    console.warn(`Film nema validan ID: ${JSON.stringify(film)}`);
                    continue;
                }
            
                try {
                    const filmUrl = `http://localhost:${this.portServis}/servis/film/${filmId}`;
                    const filmOdgovor = await fetch(filmUrl, { method: "DELETE", headers: { "Content-Type": "application/json" } });
            
                    if (filmOdgovor.ok) {
                        console.log(`Film s ID-jem ${filmId} uspešno obrisan.`);
                    } else {
                        const greska = await filmOdgovor.json();
                        console.warn(`Film s ID-jem ${filmId} nije obrisan. Status: ${filmOdgovor.status}, Greška: ${greska.greska}`);
                    }
                } catch (err) {
                    console.error(`Greška prilikom obrade filma s ID-jem ${filmId}:`, err);
                }
            }            
    
            res.status(200).json({ poruka: "Osoba i povezani filmovi uspješno obrisani." });
        } catch (error) {
            console.error("Greška u aplikacijskom sloju prilikom brisanja osobe:", error);
            res.status(500).json({ greska: "Došlo je do greške prilikom brisanja osobe." });
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
    
    async getOsobe(req: Request, res: Response) {
        const stranica = parseInt(req.query["stranica"] as string) || 1;
    
        try {
            const response = await fetch(`http://localhost:${this.portServis}/servis/osoba?stranica=${stranica}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
    
            if (!response.ok) {
                res.status(response.status).json({ greska: `Greška prilikom dohvaćanja osoba: ${response.statusText}` });
                return;
            }
    
            const podaciServisa = await response.json();
    
            if (!podaciServisa.osobe || typeof podaciServisa.trenutnaStranica !== "number" || typeof podaciServisa.ukupnoStranica !== "number") {
                res.status(500).json({ greska: "Neispravan format odgovora sa servisa." });
                return;
            }
    
            const formatiraneOsobe = podaciServisa.osobe.map((osoba: any) => ({
                id: osoba.id,
                imePrezime: osoba.ime_prezime,
                poznatPo: osoba.izvor_poznatosti,
                profilSlika: osoba.putanja_profila || "/images/default-profile.png",
            }));
    
            res.status(200).json({
                osobe: formatiraneOsobe,
                trenutnaStranica: podaciServisa.trenutnaStranica,
                ukupnoStranica: podaciServisa.ukupnoStranica,
            });
        } catch (err) {
            console.error("Greška prilikom dohvaćanja osoba:", err);
            res.status(500).json({ greska: "Interna greška servera." });
        }
    }
    
    
}
