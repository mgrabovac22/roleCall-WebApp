import { Request, Response } from "express";
import { OsobaDAO } from "../dao/osobaDAO.js";
import { Osoba } from "../../iServis/iTmdb.js";

export class RestOsoba {
  private osobaDAO: OsobaDAO;

  constructor() {
    this.osobaDAO = new OsobaDAO();
  }

  async postOsoba(zahtjev: Request, odgovor: Response) {
    const { ime_prezime, izvor_poznatosti, putanja_profila, rang_popularnosti } = zahtjev.body;

    if (!ime_prezime || !izvor_poznatosti || !putanja_profila) {
      odgovor.status(400).json({ greska: "Nedostaju obavezni podaci" });
      return;
    }

    const osoba: Osoba = {
      id: 0,
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
    const id = parseInt(zahtjev.params["id"] || "0");
    if (id === 0) {
        odgovor.status(400).json({ greska: "Nevažeći ID osobe" });
        return;
    }

    if (!id) {
      odgovor.status(400).json({ greska: "Nedostaje ID osobe" });
      return;
    }

    try {
      await this.osobaDAO.obrisi(id);
      odgovor.status(201).json({ poruka: "Osoba uspešno obrisana" });
    } catch (err) {
      console.error("Greška prilikom brisanja osobe:", err);
      odgovor.status(500).json({ greska: "Greška prilikom brisanja osobe" });
    }
  }

  async getOsobePoStranici(zahtjev: Request, odgovor: Response) {
    const stranica = parseInt(zahtjev.query["stranica"] as string) || 1;

    try {
      const osobe = await this.osobaDAO.dajSvePoStranici(stranica);
      odgovor.status(200).json(osobe);
    } catch (err) {
      console.error("Greška prilikom dohvaćanja osoba:", err);
      odgovor.status(500).json({ greska: "Greška prilikom dohvaćanja osoba" });
    }
  }

  async getOsoba(zahtjev: Request, odgovor: Response) {
    const id = parseInt(zahtjev.params["id"] || "0");
    if (id === 0) {
        odgovor.status(400).json({ greska: "Nevažeći ID osobe" });
        return;
    }

    if (!id) {
      odgovor.status(400).json({ greska: "Nedostaje ID osobe" });
      return;
    }

    try {
      const osoba = await this.osobaDAO.daj(id);
      if (!osoba) {
        odgovor.status(404).json({ greska: "Osoba nije pronađena" });
        return;
      }
      odgovor.status(200).json(osoba);
    } catch (err) {
      console.error("Greška prilikom dohvaćanja osobe:", err);
      odgovor.status(500).json({ greska: "Greška prilikom dohvaćanja osobe" });
    }
  }

  async getFilmoveOsobe(zahtjev: Request, odgovor: Response) {
    const id = parseInt(zahtjev.params["id"] || "0");
    if (id === 0) {
        odgovor.status(400).json({ greska: "Nevažeći ID osobe" });
        return;
    }
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
    const id = parseInt(zahtjev.params["id"] || "0");
    if (id === 0) {
        odgovor.status(400).json({ greska: "Nevažeći ID osobe" });
        return;
    }
    const filmovi = zahtjev.body;

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
    const id = parseInt(zahtjev.params["id"] || "0");
    if (id === 0) {
        odgovor.status(400).json({ greska: "Nevažeći ID osobe" });
        return;
    }
    const filmovi = zahtjev.body;

    if (!id || !Array.isArray(filmovi)) {
      odgovor.status(400).json({ greska: "Nedostaje ID osobe ili podaci o filmovima" });
      return;
    }

    try {
      await this.osobaDAO.obrisiVezeOsobaFilmove(id, filmovi);
      odgovor.status(201).json({ poruka: "Veze između osobe i filmova uspešno obrisane" });
    } catch (err) {
      console.error("Greška prilikom brisanja veza između osobe i filmova:", err);
      odgovor.status(500).json({ greska: "Greška prilikom brisanja veza između osobe i filmova" });
    }
  }
}
