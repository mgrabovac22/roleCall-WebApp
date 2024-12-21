import { Request, Response } from "express";
import { OsobaDAO } from "../dao/osobaDAO.js";
import { Osoba, Slika, FilmOsoba } from "../../iServis/iTmdb.js";
import { Konfiguracija } from "../../moduli/upravljateljKonfiguracije.js";
import { kreirajToken } from "../..//moduli/jwtModul.js";

export class RestOsoba {
  private osobaDAO: OsobaDAO;
  private konfiguracija: Konfiguracija;
  private portServis: number;
  
  
  constructor(portServis: number) {
    this.osobaDAO = new OsobaDAO();
    this.konfiguracija = new Konfiguracija();
    this.portServis = portServis;
  }

  async postOsoba(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");
    const { id, ime_prezime, izvor_poznatosti, putanja_profila, rang_popularnosti, slike } = zahtjev.body;

    if (!id || !ime_prezime || !izvor_poznatosti || !putanja_profila) {
        odgovor.status(400).json({ greska: "Nedostaju obavezni podaci za dodavanje osobe." });
        return;
    }

    const osoba: Osoba = {
        id,
        ime_prezime,
        izvor_poznatosti,
        putanja_profila,
        rang_popularnosti: rang_popularnosti || null,
    };

    try {
        await this.osobaDAO.dodaj(osoba);

        if (Array.isArray(slike)) {
            for (const [index, putanja_do_slike] of slike.entries()) {
                const novaSlika: Slika = {
                    id: `${index}-${id}`, 
                    putanja_do_slike,
                    osoba_id: id,
                };
                await this.osobaDAO.dodajSliku(novaSlika);
            }
        }

        odgovor.status(201).json({ status :"uspjeh" });
    } catch (err) {
        console.error("Greška prilikom dodavanja osobe i slika:", err);
        odgovor.status(500).json({ greska: "Greška prilikom dodavanja osobe i slika." });
    }
  }

  async deleteOsoba(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");
    const id = parseInt(zahtjev.params["id"] || "0");

    if (!id) {
        odgovor.status(400).json({ greska: "Nedostaje ID osobe." });
        return;
    }

    try {
        await this.osobaDAO.obrisiSveVezeFilmova(id);

        await this.osobaDAO.obrisiSliku(id);

        await this.osobaDAO.obrisi(id);

        odgovor.status(201).json({ status :"uspjeh" });
    } catch (err) {
        console.error("Greška prilikom brisanja osobe:", err);
        odgovor.status(500).json({ greska: "Greška prilikom brisanja osobe." });
    }
  }


  async getOsobePoStranici(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");

    const dozvoljeniParametri = ["stranica"];
    const neocekivaniParametri = Object.keys(zahtjev.query).filter(
        (key) => !dozvoljeniParametri.includes(key)
    );

    if (neocekivaniParametri.length > 0) {
        odgovor.status(422).json({ greska: "neočekivani podaci" });
        return;
    }

    const stranica = parseInt(zahtjev.query["stranica"] as string) || 1;
    const poStranici = 20; 

    try {
        const osobe = await this.osobaDAO.dajSvePoStranici(stranica);

        const ukupnoZapisa = await this.osobaDAO.dajUkupanBrojOsoba();
        const ukupnoStranica = Math.ceil(ukupnoZapisa / poStranici);

        const osobeSaSlikama = await Promise.all(
            osobe.map(async (osoba) => {
                const slike = await this.osobaDAO.dajSlikeOsobe(osoba.id);
                return {
                    ...osoba,
                    slike,
                };
            })
        );

        odgovor.status(200).json({
            osobe: osobeSaSlikama,
            trenutnaStranica: stranica,
            ukupnoStranica,
        });
    } catch (err) {
        console.error("Greška prilikom dohvaćanja osoba:", err);
        odgovor.status(500).json({ greska: "Greška prilikom dohvaćanja osoba" });
    }
  }

  async getOsoba(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");
    const id = parseInt(zahtjev.params["id"] || "0");

    if (!id) {
      odgovor.status(400).json({ greska: "Nevažeći ID osobe" });
      return;
    }

    try {
      const osoba = await this.osobaDAO.daj(id);
      if (!osoba) {
        odgovor.status(404).json({ greska: "Osoba nije pronađena" });
        return;
      }

      const slike = await this.osobaDAO.dajSlikeOsobe(id);

      const rezultat = {
        ...osoba,
        slike,
      };

      odgovor.status(200).json(rezultat);
    } catch (err) {
      console.error("Greška prilikom dohvaćanja osobe:", err);
      odgovor.status(500).json({ greska: "Greška prilikom dohvaćanja osobe" });
    }
  }

  async getFilmoveOsobe(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");

    const dozvoljeniParametri = ["stranica"];
    const neocekivaniParametri = Object.keys(zahtjev.query).filter(
        (key) => !dozvoljeniParametri.includes(key)
    );

    if (neocekivaniParametri.length > 0) {
        odgovor.status(422).json({ greska: "neočekivani podaci" });
        return;
    }

    const id = parseInt(zahtjev.params["id"] || "0");
    const stranica = parseInt(zahtjev.query["stranica"] as string) || 1;

    if (!id) {
      odgovor.status(400).json({ greska: "Nedostaje ID osobe" });
      return;
    }

    try {
      const filmovi = await this.osobaDAO.dajFilmoveOsobe(id, stranica);
      odgovor.status(200).json(filmovi);
    } catch (err) {
      console.error("Greška prilikom dohvaćanja filmova osobe:", err);
      odgovor.status(500).json({ greska: "Greška prilikom dohvaćanja filmova osobe" });
    }
  }

  async poveziOsobuFilmove(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");
    const id = parseInt(zahtjev.params["id"] || "0");
    const filmovi: FilmOsoba[] = zahtjev.body;

    if (!id || !Array.isArray(filmovi)) {
      odgovor.status(400).json({ greska: "Nedostaje ID osobe ili podaci o filmovima" });
      return;
    }

    try {
      await this.osobaDAO.poveziOsobuFilmove(id, filmovi);
      odgovor.status(201).json({ status :"uspjeh" });
    } catch (err) {
      console.error("Greška prilikom povezivanja osobe s filmovima:", err);
      odgovor.status(500).json({ greska: "Greška prilikom povezivanja osobe s filmovima" });
    }
  }

  async obrisiVezeOsobaFilmove(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");
    const id = parseInt(zahtjev.params["id"] || "0");

    if (!id) {
      odgovor.status(400).json({ greska: "Nedostaje ID" });
      return;
    }

    try {
      await this.osobaDAO.obrisiSveVezeFilmova(id);
      odgovor.status(201).json({ status :"uspjeh" });
    } catch (err) {
      console.error("Greška prilikom brisanja veza između osobe i filmova:", err);
      odgovor.status(500).json({ greska: "Greška prilikom brisanja veza između osobe i filmova" });
    }
  }

  async postSlika(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");
    const { putanja_do_slike, osoba_id } = zahtjev.body;

    if (!putanja_do_slike || !osoba_id) {
      odgovor.status(400).json({ greska: "Nedostaju obavezni podaci za dodavanje slike" });
      return;
    }

    const slika: Slika = {
      id: " ",
      putanja_do_slike,
      osoba_id,
    };

    try {
      await this.osobaDAO.dodajSliku(slika);
      odgovor.status(201).json({ status :"uspjeh" });
    } catch (err) {
      console.error("Greška prilikom dodavanja slike:", err);
      odgovor.status(500).json({ greska: "Greška prilikom dodavanja slike" });
    }
  }

  async dodajOsobuFilmove(req: Request, res: Response) {
    await this.konfiguracija.ucitajKonfiguraciju();
    
    const { id, ime_prezime, izvor_poznatosti, putanja_profila, rang_popularnosti } = req.body;

    if (!id || !ime_prezime || !izvor_poznatosti) {
        res.status(400).json({ greska: "Nedostaju obavezni podaci za dodavanje osobe." });
        return;
    }

    try {
        const tmdbSlikeResponse = await fetch(`https://api.themoviedb.org/3/person/${id}/images?api_key=${this.konfiguracija.dajKonf().tmdbApiKeyV3}`);
        if (!tmdbSlikeResponse.ok) {
            const greska = await tmdbSlikeResponse.json();
            res.status(tmdbSlikeResponse.status).json({
                greska: greska.status_message || "Greška prilikom dohvaćanja slika s TMDB-a.",
            });
            return;
        }
    
        const tmdbSlikeData = await tmdbSlikeResponse.json();
        const slike = tmdbSlikeData.profiles.map((slika: any) => slika.file_path);

        const korimeSessija = req.session.korime;

        if (!korimeSessija) {
            throw new Error("Korisničko ime nije definisano u sesiji.");
        }
        const notValidToken = kreirajToken({ korime: korimeSessija }, this.konfiguracija.dajKonf().jwtTajniKljuc);
        const jwtToken = `Bearer ${notValidToken}`;

        if (!jwtToken) {
            throw new Error("JWT token is missing.");
        }

        let headers = new Headers();
        headers.set("Authorization", jwtToken);
        headers.set("Content-Type", "application/json");
    
        const osobaResponse = await fetch(`http://localhost:${this.portServis}/servis/osoba`, {
            method: "POST",
            headers: headers,
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

        const tmdbFilmoviResponse = await fetch(`https://api.themoviedb.org/3/person/${id}/movie_credits?api_key=${this.konfiguracija.dajKonf().tmdbApiKeyV3}`);
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
                headers: headers,
                body: JSON.stringify({
                    id: film.id,
                    org_naslov: film.original_title,
                    naslov: film.title,
                    jezik: film.original_language,
                    datum_izdavanja: film.release_date,
                    opis: film.overview,
                    rang_popularnosti: film.popularity,
                    putanja_postera: film.poster_path
                }),
            });
            
            if (!filmResponse.ok) {
                console.warn(`Film s ID-jem ${film.id} nije uspešno dodan.`);
                continue;
            }

            const poveziFilmResponse = await fetch(`http://localhost:${this.portServis}/servis/osoba/${id}/film`, {
                method: "PUT",
                headers: headers,
                body: JSON.stringify([{ film_id: film.id, lik: film.character }]),
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

  async obrisiOsobuFilmove(req: Request, res: Response) {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({ greska: "ID osobe je obavezan za brisanje." });
            return;
        }
        
        const korimeSessija = req.session.korime;

        if (!korimeSessija) {
            throw new Error("Korisničko ime nije definisano u sesiji.");
        }
        const notValidToken = kreirajToken({ korime: korimeSessija }, this.konfiguracija.dajKonf().jwtTajniKljuc);
        const jwtToken = `Bearer ${notValidToken}`;

        if (!jwtToken) {
            throw new Error("JWT token is missing.");
        }

        let headers = new Headers();
        headers.set("Authorization", jwtToken);
        headers.set("Content-Type", "application/json");
    
        const vezeUrl = `http://localhost:${this.portServis}/servis/osoba/${id}/film`;
        const vezeOdgovor = await fetch(vezeUrl, { method: "DELETE", headers: headers });

        if (!vezeOdgovor.ok) {
            console.error(`Greška prilikom brisanja veza između osobe i filmova: ${vezeOdgovor.status}`);
            res.status(500).json({ greska: "Greška prilikom brisanja veza između osobe i filmova." });
            return;
        }
    
        const osobaUrl = `http://localhost:${this.portServis}/servis/osoba/${id}`;
        const osobaOdgovor = await fetch(osobaUrl, { method: "DELETE", headers: headers });

        if (!osobaOdgovor.ok) {
            console.error(`Greška prilikom brisanja osobe: ${osobaOdgovor.status}`);
            res.status(500).json({ greska: "Greška prilikom brisanja osobe." });
            return;
        }

        const filmoviUrl = `http://localhost:${this.portServis}/servis/film`;
        const filmovi = await fetch(filmoviUrl, { method: "GET", headers: headers });
        const filmoviJSON = await filmovi.json();

        for (const film of filmoviJSON) {
            const filmId = film.id;
        
            if (!filmId) {
                console.warn(`Film nema validan ID: ${JSON.stringify(film)}`);
                continue;
            }
        
            try {
                const filmUrl = `http://localhost:${this.portServis}/servis/film/${filmId}`;
                const filmOdgovor = await fetch(filmUrl, { method: "DELETE", headers: headers });
        
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
    console.log("sessija u provjeri: ", zahtjev.session);
    await this.konfiguracija.ucitajKonfiguraciju();

    try {
      const korimeSessija = zahtjev.session.korime;

      if (!korimeSessija) {
          throw new Error("Korisničko ime nije definisano u sesiji.");
      }
      const notValidToken = kreirajToken({ korime: korimeSessija }, this.konfiguracija.dajKonf().jwtTajniKljuc);
      const jwtToken = `Bearer ${notValidToken}`;

      if (!jwtToken) {
          throw new Error("JWT token is missing.");
      }

        const headers = new Headers();
        headers.set("Authorization", jwtToken);
        headers.set("Content-Type", "application/json");

        const id = parseInt(zahtjev.params["id"] as string);
        if (isNaN(id) || id <= 0) {
            odgovor.status(400).json({ greska: "Nevažeći ID osobe" });
            return;
        }

        const vanjskiServisUrl = `http://localhost:${this.portServis}/servis/osoba/${id}`;

        console.log("Requesting:", vanjskiServisUrl);
        const vanjskiOdgovor = await fetch(vanjskiServisUrl, { method: "GET", headers });

        if (vanjskiOdgovor.status === 200) {
            odgovor.status(200).json({ poruka: "Osoba postoji u bazi" });
        } else if (vanjskiOdgovor.status === 404) {
            odgovor.status(404).json({ poruka: "Osoba nije pronađena u bazi" });
        } else {
            throw new Error(`Unexpected status: ${vanjskiOdgovor.status}`);
        }
    } catch (error: any) {
        console.error("Error during person existence check:", error.message);
        odgovor.status(500).json({ greska: "Greška prilikom provjere postojanja osobe" });
    }
  }
}
