import { Request, Response } from "express";
import { KorisnikDAO } from "../dao/korisnikAuthDAO.js";
import { kreirajSHA256 } from "../../moduli/generatori.js";
import { Konfiguracija } from "../..//moduli/upravljateljKonfiguracije.js";
import { kreirajToken } from "../../moduli/jwtModul.js";
import { kreirajTajniKljuc, provjeriTOTP } from "../../moduli/totp.js";

export class RestAuthKorisnik {
  private korisnikDAO: KorisnikDAO;
  private konfiguracija: Konfiguracija = new Konfiguracija();

  constructor() {
    this.korisnikDAO = new KorisnikDAO();
  }

  async postKorisnik(zahtjev: Request, odgovor: Response) {
    await this.konfiguracija.ucitajKonfiguraciju();
    odgovor.type("application/json");
    const { ime, prezime, adresa, korime, lozinka, email, drzava, telefon, grad, recaptchaToken } = zahtjev.body;
  
    if (!korime || !lozinka || !email || !recaptchaToken) {
      return odgovor.status(400).json({ greska: "Nedostaju obavezni podaci (korime, lozinka, email, recaptchaToken)" });
    }
  
    try {
      const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        body: new URLSearchParams({
          secret: this.konfiguracija.dajKonf().tajniCaptchaKljuc, 
          response: recaptchaToken, 
        }),
      });
  
      const recaptchaResult = await recaptchaResponse.json();
  
      if (!recaptchaResult.success) {
        return odgovor.status(400).json({ greska: "reCAPTCHA verifikacija nije uspela." });
      }
  
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
        totp_aktiviran: false,
        totp_secret: null
      });
  
      if (uspjeh) {
        zahtjev.session.korime = korime;
        zahtjev.session.tip_korisnika = 3;
        zahtjev.session.status = "Nije poslan zahtjev";
        return odgovor.status(201).json({ poruka: "Korisnik uspješno dodan" });
      } else {
        return odgovor.status(400).json({ greska: "Dodavanje korisnika nije uspjelo. Provjerite podatke." });
      }
    } catch (err) {
      console.error("Greška prilikom dodavanja korisnika:", err);
      return odgovor.status(500).json({ greska: "Interna greška servera" });
    }
  }  

  async prijavaKorisnika(zahtjev: Request, odgovor: Response) {
    await this.konfiguracija.ucitajKonfiguraciju();
  
    odgovor.type("application/json");
    const { korime, lozinka, recaptchaToken } = zahtjev.body;
  
    if (!korime || !lozinka || !recaptchaToken) {
      odgovor.status(400).json({ greska: "Nedostaju podaci za prijavu (korime, lozinka, recaptchaToken)" });
      return;
    }
  
    try {
      const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        body: new URLSearchParams({
          secret: this.konfiguracija.dajKonf().tajniCaptchaKljuc, 
          response: recaptchaToken,
        }),
      });
  
      const recaptchaResult = await recaptchaResponse.json();
      
      if (!recaptchaResult.success || recaptchaResult.score <= 0.5) {
        odgovor.status(400).json({ greska: "reCAPTCHA verifikacija nije uspela ili ste prepoznati kao bot." });
        return;
      }
  
      const hashLozinka = kreirajSHA256(lozinka.trim(), korime.trim());
      const korisnik = await this.korisnikDAO.dajKorisnikaPoKorime(korime);
  
      if (korisnik && korisnik.lozinka === hashLozinka) {
        zahtjev.session.korime = korisnik.korime;        
        zahtjev.session.tip_korisnika = korisnik.tip_korisnika_id;
        zahtjev.session.status = korisnik.status;
  
        zahtjev.session.save((err) => {
          if (err) {
            console.error("Greška prilikom spremanja sesije:", err);
            odgovor.status(500).json({ greska: "Greška prilikom pohrane sesije" });
            return;
          }
        });
  
        const notValidToken = kreirajToken({ korime: korisnik.korime }, this.konfiguracija.dajKonf().jwtTajniKljuc);
        const token = `Bearer ${notValidToken}`;        
  
        odgovor.status(200).json({ poruka: "Prijava uspješna", korisnik, token });
        return;
      } else {
        odgovor.status(401).json({ greska: "Pogrešni podaci za prijavu ili korisnik nema pristup." });
        return;
      }
    } catch (err) {
      console.error("Greška prilikom prijave korisnika:", err);
      odgovor.status(500).json({ greska: "Interna greška servera" });
      return
    }
  }  

  async getKorisnici(zahtjev: Request, odgovor: Response) {
    if(zahtjev.session.tip_korisnika!==2){
      odgovor.status(401).json({ greska: "Nemate pristup toj metodi!"});
      return;
    }
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
    if(zahtjev.session.tip_korisnika!==2){
      odgovor.status(401).json({ greska: "Nemate pristup toj metodi!"});
      return;
    }
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
    if(req.session.tip_korisnika!==2){
      res.status(401).json({ greska: "Nemate pristup toj metodi!"});
      return;
    }
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
    if(req.session.tip_korisnika!==2){
      res.status(401).json({ greska: "Nemate pristup toj metodi!"});
      return;
    }
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
    let korime = req.session.korime;
    
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
    if(req.session.tip_korisnika!==2){
      res.status(401).json({ greska: "Nemate pristup toj metodi!"});
      return;
    }
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
    if(req.session.tip_korisnika!==2){
      res.status(401).json({ greska: "Nemate pristup toj metodi!"});
      return;
    }
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

  async aktivirajTOTP(req: Request, res: Response) {
    const korime = req.params["korime"];
  
    if (!korime) {
      res.status(400).json({ greska: "Nevažeće korime korisnika." });
      return;
    }
  
    try {
      const korisnik = await this.korisnikDAO.dajKorisnikaPoKorime(korime);      
  
      if (!korisnik) {
        res.status(404).json({ greska: "Korisnik nije pronađen." });
        return;
      }

      
  
      let tajniKljuc = korisnik.totp_secret;
      const provjeraTotp = await this.korisnikDAO.dohvatiTOTPSecret(korime);
      
  
      if (!provjeraTotp) {
        
        tajniKljuc = kreirajTajniKljuc(korisnik.korime);
        await this.korisnikDAO.aktivirajTOTP(korime, tajniKljuc);
      } else {
        
        await this.korisnikDAO.postaviZastavicuTotpa(korime);
      }
  
      res.status(200).json({ poruka: "TOTP uspješno aktiviran.", tajniKljuc });
    } catch (err) {
      console.error("Greška prilikom aktivacije TOTP-a:", err);
      res.status(500).json({ greska: "Interna greška servera." });
    }
  }
  
  async deaktivirajTOTP(req: Request, res: Response) {
    const korime = req.params["korime"];
  
    if (!korime) {
      res.status(400).json({ greska: "Nevažeće korime korisnika." });
      return;
    }
  
    try {
      await this.korisnikDAO.deaktivirajTOTP(korime);
      res.status(200).json({ poruka: "TOTP uspješno deaktiviran." });
    } catch (err) {
      console.error("Greška prilikom deaktivacije TOTP-a:", err);
      res.status(500).json({ greska: "Interna greška servera." });
    }
  }  

  async dohvatiTOTPSecret(req: Request, res: Response) {
    const korime = req.params["korime"];

    if (!korime) {
        res.status(400).json({ greska: "Nevažeći ID korisnika." });
        return;
    }

    try {
        const totpSecret = await this.korisnikDAO.dohvatiTOTPSecret(korime);
        if (totpSecret) {
            res.status(200).json({ totpSecret });
        } else {
            res.status(404).json({ greska: "TOTP tajni ključ nije pronađen." });
        }
    } catch (err) {
        console.error("Greška prilikom dohvaćanja TOTP tajnog ključa:", err);
        res.status(500).json({ greska: "Interna greška servera." });
    }
  }

  async totpStatus(req: Request, res: Response) {
    const korime = req.params["korime"];

    if (!korime) {
        res.status(400).json({ greska: "Nevažeći ID korisnika." });
        return;
    }

    try {
        const status = await this.korisnikDAO.provjeriTOTPStatus(korime);
        
        if (status!==null) {
            res.status(200).json({ status });
        } else {
            res.status(404).json({ greska: "Korisnik nije pronađen!" });
        }
    } catch (err) {
        console.error("Greška prilikom dohvaćanja TOTP tajnog ključa:", err);
        res.status(500).json({ greska: "Interna greška servera." });
    }
  }

  async provjeriTOTP(req: Request, res: Response) {
    const korime = req.params["korime"];
    const { uneseniKod } = req.body;

    if (!korime || !uneseniKod) {
      res.status(400).json({ greska: "Nedostaje TOTP kod." });
      return;
    }

    try {
      const korisnik = await this.korisnikDAO.dajKorisnikaPoKorime(korime);

      if (!korisnik || !korisnik.totp_secret) {
        res.status(404).json({ greska: "Korisnik ili njegov TOTP tajni ključ nisu pronađeni." });
        return;
      }

      const isValid = provjeriTOTP(uneseniKod, korisnik.totp_secret);

      if (isValid) {
        res.status(200).json({ poruka: "TOTP kod je ispravan." });
      } else {
        res.status(401).json({ greska: "Neispravan TOTP kod." });
      }
    } catch (err) {
      console.error("Greška prilikom provjere TOTP koda:", err);
      res.status(500).json({ greska: "Interna greška servera." });
    }
  }

}
