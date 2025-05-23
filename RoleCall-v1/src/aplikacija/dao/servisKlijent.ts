import { Request, Response } from "express";
import { KorisnikDAO } from "./korisnikDAO.js";
import { kreirajSHA256 } from "../../moduli/generatori.js";

export class RestKorisnik {
  private korisnikDAO: KorisnikDAO;

  constructor() {
    this.korisnikDAO = new KorisnikDAO();
  }

  async postKorisnik(zahtjev: Request, odgovor: Response) {
    odgovor.type("application/json");
    const { ime, prezime, adresa, korime, lozinka, email, drzava, telefon, grad } = zahtjev.body;

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
        tip_korisnika_id: 3, 
        status: "Nije poslan zahtjev", 
        drzava: drzava || null,
        telefon: telefon || null,
        grad: grad || null,
      });
      
      if (uspjeh) {
        zahtjev.session.korime = korime;
        zahtjev.session.tip_korisnika = 3;
        zahtjev.session.status = "Nije poslan zahtjev";
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

    if (!korime || !lozinka) {
      odgovor.status(400).json({ greska: "Nedostaju podaci za prijavu (korime, lozinka)" });
      return;
    }

    try {
      const hashLozinka = kreirajSHA256(lozinka.trim(), korime.trim());
      const korisnik = await this.korisnikDAO.dajKorisnikaPoKorime(korime);

      if (korisnik && korisnik.lozinka === hashLozinka) {
          zahtjev.session.korime = korisnik.korime;
          zahtjev.session.tip_korisnika = korisnik.tip_korisnika_id;
          zahtjev.session.status = korisnik.status;
        odgovor.status(200).json({ poruka: "Prijava uspješna", korisnik });
      } else {
        odgovor.status(401).json({ greska: "Pogrešni podaci za prijavu ili korisnik nema pristup." });
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

  async dajPristup(req: Request, res: Response) {
    const korisnikId = parseInt(req.params["id"] as string, 10);
    if (!korisnikId) {
      res.status(400).json({ greska: "Nevažeći ID korisnika" });
      return;
    }

    try {
      
      await this.korisnikDAO.azurirajStatusKorisnika(korisnikId, "Ima pristup");
      await this.korisnikDAO.postaviTipKorisnikaPoID(korisnikId, 1);
      res.status(200).json({ poruka: "Pristup omogućen" });
    } catch (err) {
      console.error("Greška prilikom davanja pristupa korisniku:", err);
      res.status(500).json({ greska: "Interna greška servera" });
    }
  }

  async zabraniPristup(req: Request, res: Response) {
    const korisnikId = parseInt(req.params["id"] as string, 10);
    if (!korisnikId) {
      res.status(400).json({ greska: "Nevažeći ID korisnika" });
      return;
    }

    try {
      await this.korisnikDAO.azurirajStatusKorisnika(korisnikId, "Zabranjen mu je pristup");
      await this.korisnikDAO.postaviTipKorisnikaPoID(korisnikId, 3);
      res.status(200).json({ poruka: "Pristup zabranjen" });
    } catch (err) {
      console.error("Greška prilikom zabrane pristupa korisniku:", err);
      res.status(500).json({ greska: "Interna greška servera" });
    }
  }

  async dohvatiTrenutnogKorisnika(req: Request, res: Response) {
    res.type("application/json");
    const korime = req.session.korime;

    if (!korime) {
        res.status(401).json({ greska: "Niste prijavljeni" });
        return;
    }

    try {
        const korisnik = await this.korisnikDAO.dajKorisnikaPoKorime(korime);
        if (!korisnik) {
            res.status(404).json({ greska: "Korisnik nije pronađen" });
        } else {
            res.status(200).json(korisnik);
        }
    } catch (err) {
        console.error("Greška prilikom dohvaćanja trenutnog korisnika:", err);
        res.status(500).json({ greska: "Interna greška servera" });
    }
  }

  async deleteKorisnik(req: Request, res: Response) {
    res.type("application/json");
    const korisnikId = parseInt(req.params["id"] as string, 10);

    if (!korisnikId || isNaN(korisnikId)) {
        res.status(400).json({ greska: "ID korisnika nije valjan ili nije dostavljen" });
        return;
    }

    try {
        await this.korisnikDAO.obrisiKorisnika(korisnikId);
        
          res.status(200).json({ status: "uspjeh" });
    } catch (err) {
        console.error("Greška prilikom brisanja korisnika:", err);
        res.status(500).json({ greska: "Interna greška servera" });
    }
  }

  async postZahtjevAdminu(req: Request, res: Response) {
    const korime = req.session.korime;

    if (!korime) {
        res.status(400).json({ greska: "Korisničko ime je obavezno za slanje zahtjeva." });
        return;
    }

    try {
        const korisnik = await this.korisnikDAO.dajKorisnikaPoKorime(korime);
        if (!korisnik) {
            res.status(404).json({ greska: "Korisnik ne postoji." });
            return;
        }

        if (korisnik.status === "ima pristup") {
            res.status(409).json({ greska: "Korisnik već ima ovlasti." });
            return;
        }

        await this.korisnikDAO.postaviStatusZahtjeva(korime, "Poslan zahtjev");

        res.status(200).json({ poruka: "Zahtjev je uspješno poslan adminu." });
    } catch (err) {
        console.error("Greška prilikom slanja zahtjeva adminu:", err);
        res.status(500).json({ greska: "Interna greška servera." });
    }
  }

  async getKorisnik(req: Request, res: Response) {
    const korisnikId = parseInt(req.params["id"] as string, 10);

    if (isNaN(korisnikId) || korisnikId <= 0) {
        res.status(400).json({ greska: "Nevažeći ID korisnika." });
        return;
    }

    try {
        const korisnik = await this.korisnikDAO.dajKorisnikaPoId(korisnikId);

        if (!korisnik) {
            res.status(404).json({ greska: "Korisnik nije pronađen." });
            return;
        }

        res.status(200).json({
            id: korisnik.id,
            korime: korisnik.korime,
            status: korisnik.status,
            tip_korisnika_id: korisnik.tip_korisnika_id,
            email: korisnik.email,
        });
    } catch (err) {
        console.error("Greška prilikom dohvaćanja korisnika:", err);
        res.status(500).json({ greska: "Interna greška servera." });
    }
  }
}
