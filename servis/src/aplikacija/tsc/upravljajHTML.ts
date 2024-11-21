/*import path from "path";
import fs from "fs/promises";
import { ServisKlijent } from "./korisnikServis.js";
import { Request, Response } from "express";
import { __dirname } from "../../moduli/okolinaUtils.js";
import { Session } from "express-session";
import { Korisnik } from "../../iAplikacija/iKorisnik.js";

export interface RWASession extends Session {
  korisnik: string | null;
  korime: string;
}

export class HtmlUpravitelj {
  private tajniKljucJWT: string;
  private servisKlijent: ServisKlijent;
  private portRest: number;

  constructor(tajniKljucJWT: string, portRest: number) {
    this.tajniKljucJWT = tajniKljucJWT;
    this.servisKlijent = new ServisKlijent();
    this.portRest = portRest;
  }

  async pocetna(zahtjev: Request, odgovor: Response) {
    let pocetna = await this.ucitajStranicu("pocetna");
    odgovor.cookie("portRest", this.portRest, { httpOnly: false });
    odgovor.send(pocetna);
  }

  async registracija(zahtjev: Request, odgovor: Response) {
    let greska = "";
    if (zahtjev.method === "POST") {
      const uspjeh = await this.servisKlijent.dodajKorisnika(zahtjev.body);
      if (uspjeh) {
        odgovor.redirect("/prijava");
        return;
      } else {
        greska = "Dodavanje nije uspjelo, provjerite podatke!";
      }
    }

    let stranica = await this.ucitajStranicu("registracija", greska);
    odgovor.send(stranica);
  }

  async odjava(zahtjev: Request, odgovor: Response) {
    const sesija = zahtjev.session as RWASession;
    sesija.korisnik = null;
    zahtjev.session.destroy((err) => {
      if (err) {
        console.error("Greška pri uništavanju sesije:", err);
      }
    });
    odgovor.redirect("/");
  }

  async prijava(zahtjev: Request, odgovor: Response) {
    let greska = "";
    if (zahtjev.method === "POST") {
      const { korime, lozinka } = zahtjev.body;
      const korisnik = await this.servisKlijent.prijaviKorisnika(korime, lozinka);

      if (korisnik) {
        const sesija = zahtjev.session as RWASession;
        sesija.korisnik = `${korisnik.ime} ${korisnik.prezime}`;
        sesija.korime = korisnik.korime;
        odgovor.redirect("/");
        return;
      } else {
        greska = "Netocni podaci!";
      }
    }

    let stranica = await this.ucitajStranicu("prijava", greska);
    odgovor.send(stranica);
  }

  async filmoviPretrazivanje(zahtjev: Request, odgovor: Response) {
    let stranica = await this.ucitajStranicu("filmovi_pretrazivanje");
    odgovor.send(stranica);
  }

  private async ucitajStranicu(nazivStranice: string, poruka: string = "") {
    try {
      const stranica = await this.ucitajHTML(nazivStranice);
      return stranica.replace("#poruka#", poruka);
    } catch (error) {
      console.error(`Greška pri učitavanju stranice "${nazivStranice}":`, error);
      return "<h1>Greška pri učitavanju stranice</h1>";
    }
  }

  private async ucitajHTML(htmlStranica: string): Promise<string> {
    try {
      const filePath = path.join(__dirname(), "html", `${htmlStranica}.html`);
      return await fs.readFile(filePath, "utf-8");
    } catch (error) {
      console.error(`Greška pri učitavanju HTML datoteke "${htmlStranica}":`, error);
      throw error;
    }
  }
}*/
