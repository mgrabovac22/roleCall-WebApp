import { Request, Response } from "express";
import { FilmDAO } from "../dao/filmDAO.js";
import { Film } from "../../iServis/iTmdb.js";

export class RestFilm {
  private filmDAO: FilmDAO;

  constructor() {
    this.filmDAO = new FilmDAO();
  }

  async getFilmove(req: Request, res: Response) {
    const stranica = parseInt(req.query["stranica"] as string) || 1;
    const datumOd = req.query["datumOd"] as string;
    const datumDo = req.query["datumDo"] as string;

    try {
      const filmovi = await this.filmDAO.dajFilmovePoStranici(stranica, datumOd, datumDo);
      res.status(200).json(filmovi);
    } catch (err) {
      console.error("Greška prilikom dohvaćanja filmova:", err);
      res.status(500).json({ greska: "Greška prilikom dohvaćanja filmova" });
    }
  }

  async postFilm(req: Request, res: Response) {
    const film: Film = req.body;

    if (!film.jezik || !film.org_naslov || !film.naslov || !film.datum_izdavanja) {
      res.status(400).json({ greska: "Nedostaju obavezni podaci za dodavanje filma" });
      return;
    }

    try {
      await this.filmDAO.dodajFilm(film);
      res.status(201).json({ poruka: "Film uspešno dodan" });
    } catch (err) {
      console.error("Greška prilikom dodavanja filma:", err);
      res.status(500).json({ greska: "Greška prilikom dodavanja filma" });
    }
  }

  async getFilm(req: Request, res: Response) {
    const id = parseInt(req.params["id"] || "0");
    if (id === 0) {
      res.status(400).json({ greska: "Nevažeći ID filma" });
      return;
    }
  
    try {
      const film = await this.filmDAO.dajFilm(id);
      if (!film) {
        res.status(404).json({ greska: "Film nije pronađen" });
        return;
      }
      res.status(200).json(film);
    } catch (err) {
      const error = err as Error; 
      console.error("Greška prilikom dohvaćanja filma:", error.message);
      res.status(500).json({ greska: "Greška prilikom dohvaćanja filma" });
    }
  }
  
  async deleteFilm(req: Request, res: Response) {
    const id = parseInt(req.params["id"] || "0");
    if (id === 0) {
      res.status(400).json({ greska: "Nevažeći ID filma" });
      return;
    }
  
    try {
      const success = await this.filmDAO.obrisiFilm(id);
      if (success) {
        res.status(201).json({ poruka: "Film uspešno obrisan" });
      }
    } catch (err) {
      const error = err as Error;
      if (error.message === "Film ima povezane osobe i ne može biti obrisan.") {
        res.status(409).json({ greska: error.message });
      } else {
        console.error("Greška prilikom brisanja filma:", error.message);
        res.status(500).json({ greska: "Greška prilikom brisanja filma" });
      }
    }
  }
  
}
