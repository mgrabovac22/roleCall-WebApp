import { Korisnik, TipKorisnika } from "../../iAplikacija/iKorisnik.js";
import Baza from "../db/bazaSQLite.js";
import path from "path";
import { __dirname } from "../../moduli/okolinaUtils.js";

export class KorisnikDAO {
  private baza: Baza;

  constructor() {
    const apsolutnaPutanja = path.resolve(__dirname(), "../../../podaci/RWA2024mgrabovac22_web.sqlite");
    this.baza = new Baza(apsolutnaPutanja);
  }

  async dodajKorisnika(korisnik: Korisnik): Promise<boolean> {
    try {
      const sql = `
        INSERT INTO korisnik (ime, prezime, adresa, korime, lozinka, email, tip_korisnika_id, status, telefon, grad, država)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const podaci = [
        korisnik.ime || null,
        korisnik.prezime || null,
        korisnik.adresa || null,
        korisnik.korime,
        korisnik.lozinka,
        korisnik.email,
        korisnik.tip_korisnika_id || 1, 
        korisnik.status || "Poslan zahtjev",  
        korisnik.telefon || null,      
        korisnik.grad || null,         
        korisnik.drzava || null,       
      ];

      await this.baza.ubaciAzurirajPodatke(sql, podaci);
      return true;
    } catch (err) {
      console.error("Greška prilikom dodavanja korisnika u bazu:", err);
      return false;
    }
  }

  async dajKorisnikaPoKorime(korime: string): Promise<Korisnik | null> {
    const sql = "SELECT * FROM korisnik WHERE korime = ?";
    const podaci = (await this.baza.dajPodatkePromise(sql, [korime])) as Array<any>;

    if (podaci.length === 1) {
      return podaci[0] as Korisnik;
    }
    return null;
  }

  async dajSveKorisnike(): Promise<Korisnik[]> {
    const sql = "SELECT * FROM korisnik";
    const podaci = (await this.baza.dajPodatkePromise(sql, [])) as Array<Korisnik>;
    return podaci;
  }

  async dajTipoveKorisnika(): Promise<TipKorisnika[]> {
    const sql = "SELECT * FROM tip_korisnika";
    const podaci = (await this.baza.dajPodatkePromise(sql, [])) as Array<TipKorisnika>;
    return podaci;
  }

  async azurirajStatusKorisnika(id: number, noviStatus: string): Promise<void> {
    const sql = "UPDATE korisnik SET status = ? WHERE id = ?";
    await this.baza.ubaciAzurirajPodatke(sql, [noviStatus, id]);
  }

  async postaviTipKorisnikaPoID(korisnikID: number, noviTip: number): Promise<void> {
    const sql = `
        UPDATE korisnik
        SET tip_korisnika_ID = ?
        WHERE id = ?
    `;
    console.log(`Ažuriram tip korisnika s ID ${korisnikID} na ${noviTip}`);
    try {
        await this.baza.ubaciAzurirajPodatke(sql, [noviTip, korisnikID]);
    } catch (err) {
        console.error("Greška prilikom ažuriranja tipa korisnika:", err);
        throw err;
    }
  }


  async azurirajKorisnika(korisnik: Korisnik): Promise<boolean> {
    try {
      const sql = `
        UPDATE korisnik
        SET ime = ?, prezime = ?, adresa = ?, korime = ?, lozinka = ?, email = ?, tip_korisnika_id = ?, status = ?, telefon = ?, grad = ?, država = ?
        WHERE id = ?
      `;
      const podaci = [
        korisnik.ime || null,
        korisnik.prezime || null,
        korisnik.adresa || null,
        korisnik.korime,
        korisnik.lozinka,
        korisnik.email,
        korisnik.tip_korisnika_id,
        korisnik.status || null,
        korisnik.telefon || null,  
        korisnik.grad || null,   
        korisnik.drzava || null,   
        korisnik.id,
      ];

      await this.baza.ubaciAzurirajPodatke(sql, podaci);
      return true;
    } catch (err) {
      console.error("Greška prilikom ažuriranja korisnika:", err);
      return false;
    }
  }

  async obrisiKorisnika(id: number): Promise<void> {
    const sql = "DELETE FROM korisnik WHERE id = ?";
    await this.baza.ubaciAzurirajPodatke(sql, [id]);
  }

  async postaviStatusZahtjeva(korime: string, noviStatus: string): Promise<void> {
    const sql = `
        UPDATE korisnik
        SET status = ?
        WHERE korime = ?
    `;
    console.log(`Postavljam status korisnika ${korime} na ${noviStatus}`);
    try {
        await this.baza.ubaciAzurirajPodatke(sql, [noviStatus, korime]);
    } catch (err) {
        console.error("Greška prilikom ažuriranja statusa korisnika:", err);
        throw err;
    }
  }

  async dajKorisnikaPoId(korisnikId: number): Promise<Korisnik | null> {
    const sql = `
        SELECT id, korime, status, tip_korisnika_id, email
        FROM korisnik
        WHERE id = ?
    `;

    const podaci = (await this.baza.dajPodatkePromise(sql, [korisnikId])) as Array<any>;

    if (podaci.length === 1) {
        return podaci[0] as Korisnik;
    }

    return null;
  }


}
