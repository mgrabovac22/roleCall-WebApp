import { Request, Response } from "express";
import { KorisnikDAO } from "../dao/korisnikDAO.js";
import { kreirajSHA256 } from "../../moduli/generatori.js";

export class RestKorisnik {
  private korisnikDAO: KorisnikDAO;

  constructor() {
    this.korisnikDAO = new KorisnikDAO();
  }

  async postKorisnik(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");
    const { ime, prezime, adresa, korime, lozinka, email, tip_korisnika_id, status } = zahtjev.body;

    if (!korime || !lozinka || !email || !tip_korisnika_id) {
      odgovor.status(400).json({ greska: "Nedostaju obavezni podaci (korime, lozinka, email, tip_korisnika_id)" });
      return;
    }

    try {
      let hashLozinka = kreirajSHA256(lozinka.trim(), korime.trim());
      const uspjeh = await this.korisnikDAO.dodajKorisnika({
        id: 0, 
        ime: ime || null,
        prezime: prezime || null,
        adresa: adresa || null,
        korime,
        lozinka: hashLozinka,
        email,
        tip_korisnika_id,
        status: status || null,
      });

      if (uspjeh) {
        odgovor.status(201).json({ poruka: "Korisnik uspješno dodan" });
      } else {
        odgovor.status(400).json({ greska: "Dodavanje korisnika nije uspjelo" });
      }
    } catch (err) {
      console.error("Greška prilikom dodavanja korisnika:", err);
      odgovor.status(500).json({ greska: "Interna greška servera" });
    }
  }

  async prijavaKorisnika(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");
    const { korime, lozinka } = zahtjev.body;
    
    let hashLozinka = kreirajSHA256(lozinka.trim(), korime.trim());
    
    if (!korime || !lozinka) {
      odgovor.status(400).json({ greska: "Nedostaju podaci za prijavu (korime, lozinka)" });
      return;
    }

    try {
      const korisnik = await this.korisnikDAO.dajKorisnikaPoKorime(korime);
      
      if (korisnik && korisnik.lozinka === hashLozinka) {
        
        //zahtjev.session.korisnik = korisnik;
        odgovor.status(200).json({ poruka: "Prijava uspješna", korisnik });
      } else {
        odgovor.status(401).json({ greska: "Pogrešni podaci za prijavu" });
      }
    } catch (err) {
      console.error("Greška prilikom prijave korisnika:", err);
      odgovor.status(500).json({ greska: "Interna greška servera" });
    }
  }

  async getKorisnici(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");
    try {
      const korisnici = await this.korisnikDAO.dajSveKorisnike();
      odgovor.status(200).json(korisnici);
    } catch (err) {
      console.error("Greška prilikom dohvaćanja korisnika:", err);
      odgovor.status(500).json({ greska: "Interna greška servera" });
    }
  }

  async getTipoviKorisnika(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");
    try {
      const tipoviKorisnika = await this.korisnikDAO.dajTipoveKorisnika();
      odgovor.status(200).json(tipoviKorisnika);
    } catch (err) {
      console.error("Greška prilikom dohvaćanja tipova korisnika:", err);
      odgovor.status(500).json({ greska: "Interna greška servera" });
    }
  }
}
