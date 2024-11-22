import { Request, Response } from "express";
import { FilmDAO } from "../dao/filmDAO.js";
import { Film } from "../../iServis/iTmdb.js";

export class RestFilm {
  private filmDAO: FilmDAO;

  constructor() {
    this.filmDAO = new FilmDAO();
  }

  async getFilmove(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");
    const stranica = parseInt(zahtjev.query["stranica"] as string) || 1;
    const datumOd = zahtjev.query["datumOd"] as string;
    const datumDo = zahtjev.query["datumDo"] as string;

    try {
      const filmovi = await this.filmDAO.dajFilmovePoStranici(stranica, datumOd, datumDo);
      odgovor.status(200).json(filmovi);
    } catch (err) {
      console.error("Greška prilikom dohvaćanja filmova:", err);
      odgovor.status(500).json({ greska: "Greška prilikom dohvaćanja filmova" });
    }
  }

  async postFilm(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");
    const film: Film = zahtjev.body;

    if (!film.id || !film.jezik || !film.org_naslov || !film.naslov || !film.datum_izdavanja) {
      odgovor.status(400).json({ greska: "Nedostaju obavezni podaci za dodavanje filma" });
      return;
    }

    try {
      const postojiFilm = await this.filmDAO.dajFilm(film.id);
      if (postojiFilm) {
        odgovor.status(409).json({ greska: "Film s navedenim ID-jem već postoji" });
        return;
      }

      await this.filmDAO.dodajFilm(film);
      odgovor.status(201).json({ poruka: "Film uspešno dodan" });
    } catch (err) {
      console.error("Greška prilikom dodavanja filma:", err);
      odgovor.status(500).json({ greska: "Greška prilikom dodavanja filma" });
    }
  }

  async getFilm(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");
    const id = parseInt(zahtjev.params["id"] || "0");
    if (id === 0) {
      odgovor.status(400).json({ greska: "Nevažeći ID filma" });
      return;
    }

    try {
      const film = await this.filmDAO.dajFilm(id);
      if (!film) {
        odgovor.status(404).json({ greska: "Film nije pronađen" });
        return;
      }
      odgovor.status(200).json(film);
    } catch (err) {
      console.error("Greška prilikom dohvaćanja filma:", err);
      odgovor.status(500).json({ greska: "Greška prilikom dohvaćanja filma" });
    }
  }

  async deleteFilm(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");
    const id = parseInt(zahtjev.params["id"] || "0");
    if (id === 0) {
      odgovor.status(400).json({ greska: "Nevažeći ID filma" });
      return;
    }

    try {
      const success = await this.filmDAO.obrisiFilm(id);
      if (success) {
        odgovor.status(200).json({ poruka: "Film uspešno obrisan" });
      }
    } catch (err) {
      if (err instanceof Error && err.message === "Film ima povezane osobe i ne može biti obrisan.") {
        odgovor.status(409).json({ greska: err.message });
      } else {
        console.error("Greška prilikom brisanja filma:", err);
        odgovor.status(500).json({ greska: "Greška prilikom brisanja filma" });
      }
    }
  }
}
