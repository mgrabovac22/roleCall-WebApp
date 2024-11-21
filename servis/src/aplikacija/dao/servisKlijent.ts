import { KorisnikDAO } from "./korisnikDAO.js";
import { Korisnik, TipKorisnika } from "../../iAplikacija/iKorisnik.js";

export class ServisKlijent {
  private korisnikDAO: KorisnikDAO;

  constructor() {
    this.korisnikDAO = new KorisnikDAO();
  }

  async dodajKorisnika(korisnik: Korisnik): Promise<boolean> {
    try {
      return await this.korisnikDAO.dodajKorisnika(korisnik);
    } catch (error) {
      console.error("Greška pri dodavanju korisnika:", error);
      return false;
    }
  }

  async prijaviKorisnika(korime: string, lozinka: string): Promise<Korisnik | null> {
    try {
      const korisnik = await this.korisnikDAO.dajKorisnikaPoKorime(korime);
      if (korisnik && korisnik.lozinka === lozinka) {
        return korisnik;
      }
      return null;
    } catch (error) {
      console.error("Greška pri prijavi korisnika:", error);
      return null;
    }
  }

  async dajSveKorisnike(): Promise<Korisnik[]> {
    try {
      return await this.korisnikDAO.dajSveKorisnike();
    } catch (error) {
      console.error("Greška pri dohvaćanju korisnika:", error);
      return [];
    }
  }

  async dajTipoveKorisnika(): Promise<TipKorisnika[]> {
    try {
      return await this.korisnikDAO.dajTipoveKorisnika();
    } catch (error) {
      console.error("Greška pri dohvaćanju tipova korisnika:", error);
      return [];
    }
  }
}
