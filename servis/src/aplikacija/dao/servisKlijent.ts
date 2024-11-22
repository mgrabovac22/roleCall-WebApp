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
    const { ime, prezime, adresa, korime, lozinka, email } = zahtjev.body;

    if (!korime || !lozinka || !email) {
        odgovor.status(400).json({ greska: "Nedostaju obavezni podaci (korime, lozinka, email)" });
        return;
    }

    try {
        const hashLozinka = kreirajSHA256(lozinka.trim(), korime.trim());

        const uspjeh = await this.korisnikDAO.dodajKorisnika({
            id: 0, 
            ime: ime || null,
            prezime: prezime || null,
            adresa: adresa || null,
            korime: korime.trim(),
            lozinka: hashLozinka,
            email: email.trim(),
            tip_korisnika_id: 1,
            status: "pending",
        });

        if (uspjeh) {
            odgovor.status(201).json({ poruka: "Korisnik uspješno dodan" });
        } else {
            odgovor.status(400).json({ greska: "Dodavanje korisnika nije uspjelo. Provjerite podatke." });
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
        if(korisnik.status=="ima pristup"){
          zahtjev.session.korime = korisnik.korime;
        }
        odgovor.status(200).json({ poruka: "Prijava uspješna", korisnik });
        return;
      } else {
        odgovor.status(401).json({ greska: "Pogrešni podaci za prijavu" });
        return;
      }
    } catch (err) {
      console.error("Greška prilikom prijave korisnika:", err);
      odgovor.status(500).json({ greska: "Interna greška servera" });
      return;
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

  async dajPristup(req: Request, res: Response) {
    const korisnikId = parseInt(req.params["id"] as any);
    if (!korisnikId) {
        res.status(400).json({ greska: "Nevažeći ID korisnika" });
        return;
    }

    try {
        await this.korisnikDAO.azurirajStatusKorisnika(korisnikId, "ima pristup");
        res.status(200).json({ poruka: "Pristup omogućen" });
    } catch (error) {
        console.error("Greška prilikom davanja pristupa korisniku:", error);
        res.status(500).json({ greska: "Interna greška servera" });
    }
  }

  async zabraniPristup(req: Request, res: Response) {
    const korisnikId = parseInt(req.params["id"] as any);
    if (!korisnikId) {
        res.status(400).json({ greska: "Nevažeći ID korisnika" });
        return;
    }

    try {
        await this.korisnikDAO.azurirajStatusKorisnika(korisnikId, "nema pristup");
        res.status(200).json({ poruka: "Pristup zabranjen" });
    } catch (error) {
        console.error("Greška prilikom zabrane pristupa korisniku:", error);
        res.status(500).json({ greska: "Interna greška servera" });
    }
  }


}
