import { Request, Response } from "express";
import { KorisnikDAO } from "../dao/korisnikDAO.js";
import { Korisnik } from "../../iServis/iKorisnik.js";

export class RestKorisnik {
  private kdao: KorisnikDAO;

  constructor() {
    this.kdao = new KorisnikDAO();
  }

  async postKorisnici(zahtjev: Request, odgovor: Response) {
    const { korime, status, korisnici_id } = zahtjev.body;

    if (!korime || !status || !korisnici_id) {
      odgovor.status(400).json({ greska: "Nedostaju obavezni podaci" });
      return;
    }

    const korisnik: Korisnik = {
      id: 0, 
      korime,
      status,
      korisnici_id,
    };

    try {
      await this.kdao.dodaj(korisnik);
      odgovor.status(201).json({ poruka: "Korisnik uspešno dodan" });
    } catch (err) {
      console.error("Greška prilikom dodavanja korisnika:", err);
      odgovor.status(500).json({ greska: "Greška prilikom dodavanja korisnika" });
    }
  }

  async deleteKorisnik(zahtjev: Request, odgovor: Response) {
    const korime = zahtjev.params['korime'];

    if (!korime) {
      odgovor.status(400).json({ greska: "Nedostaje korisničko ime" });
      return;
    }

    try {
      await this.kdao.obrisi(korime);
      odgovor.status(200).json({ poruka: "Korisnik uspešno obrisan" });
    } catch (err) {
      console.error("Greška prilikom brisanja korisnika:", err);
      odgovor.status(500).json({ greska: "Greška prilikom brisanja korisnika" });
    }
  }

  getKorisnici(zahtjev: Request, odgovor: Response) {
    odgovor.status(405).json({ greska: "GET metoda nije dopuštena" });
  }

  putKorisnici(zahtjev: Request, odgovor: Response) {
    odgovor.status(405).json({ greska: "PUT metoda nije dopuštena" });
  }
}
