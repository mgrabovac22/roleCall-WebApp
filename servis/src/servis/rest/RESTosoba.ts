import { Request, Response } from "express";
import { OsobaDAO } from "../dao/osobaDAO.js";
import { Osoba, Slika, FilmOsoba } from "../../iServis/iTmdb.js";

export class RestOsoba {
  private osobaDAO: OsobaDAO;

  constructor() {
    this.osobaDAO = new OsobaDAO();
  }

  async postOsoba(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");
    const { id, ime_prezime, izvor_poznatosti, putanja_profila, rang_popularnosti } = zahtjev.body;

    if (!id || !ime_prezime || !izvor_poznatosti || !putanja_profila) {
      odgovor.status(400).json({ greska: "Nedostaju obavezni podaci" });
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
      odgovor.status(201).json({ poruka: "Osoba uspešno dodana" });
    } catch (err) {
      console.error("Greška prilikom dodavanja osobe:", err);
      odgovor.status(500).json({ greska: "Greška prilikom dodavanja osobe" });
    }
  }

  async deleteOsoba(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");
    const id = parseInt(zahtjev.params["id"] || "0");

    if (!id) {
      odgovor.status(400).json({ greska: "Nedostaje ID osobe" });
      return;
    }

    try {
      await this.osobaDAO.obrisi(id);
      odgovor.status(200).json({ poruka: "Osoba uspešno obrisana" });
    } catch (err) {
      console.error("Greška prilikom brisanja osobe:", err);
      odgovor.status(500).json({ greska: "Greška prilikom brisanja osobe" });
    }
  }

  async getOsobePoStranici(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");
    const stranica = parseInt(zahtjev.query["stranica"] as string) || 1;

    try {
      const osobe = await this.osobaDAO.dajSvePoStranici(stranica);

      const osobeSaSlikama = await Promise.all(
        osobe.map(async (osoba) => {
          const slike = await this.osobaDAO.dajSlikeOsobe(osoba.id);
          return {
            ...osoba,
            slike,
          };
        })
      );

      odgovor.status(200).json(osobeSaSlikama);
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
      odgovor.status(200).json({ poruka: "Osoba uspešno povezana s filmovima" });
    } catch (err) {
      console.error("Greška prilikom povezivanja osobe s filmovima:", err);
      odgovor.status(500).json({ greska: "Greška prilikom povezivanja osobe s filmovima" });
    }
  }

  async obrisiVezeOsobaFilmove(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");
    const id = parseInt(zahtjev.params["id"] || "0");
    const filmovi: number[] = zahtjev.body;

    if (!id || !Array.isArray(filmovi)) {
      odgovor.status(400).json({ greska: "Nedostaje ID osobe ili podaci o filmovima" });
      return;
    }

    try {
      await this.osobaDAO.obrisiVezeOsobaFilmove(id, filmovi);
      odgovor.status(200).json({ poruka: "Veze između osobe i filmova uspešno obrisane" });
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
      id: 0,
      putanja_do_slike,
      osoba_id,
    };

    try {
      await this.osobaDAO.dodajSliku(slika);
      odgovor.status(201).json({ poruka: "Slika uspešno dodana" });
    } catch (err) {
      console.error("Greška prilikom dodavanja slike:", err);
      odgovor.status(500).json({ greska: "Greška prilikom dodavanja slike" });
    }
  }
}
