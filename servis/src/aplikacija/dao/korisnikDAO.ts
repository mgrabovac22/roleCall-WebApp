import { Korisnik, TipKorisnika } from "../../iAplikacija/iKorisnik.js";
import Baza from "../db/bazaSQLite.js";
import path from "path";
import { __dirname } from "../../moduli/okolinaUtils.js";

export class KorisnikDAO {
  private baza: Baza;

  constructor() {
    const apsolutnaPutanja = path.resolve(__dirname(), "../../../podaci/RWA2024mgrabovac22_servis.sqlite");
    this.baza = new Baza(apsolutnaPutanja);
  }

  async dodajKorisnika(korisnik: Korisnik): Promise<boolean> {
    const sql = `
      INSERT INTO korisnik (ime, prezime, adresa, korime, lozinka, email, tip_korisnika_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const podaci = [
      korisnik.ime,
      korisnik.prezime,
      korisnik.adresa,
      korisnik.korime,
      korisnik.lozinka,
      korisnik.email,
      korisnik.tip_korisnika_id,
      korisnik.status,
    ];

    await this.baza.ubaciAzurirajPodatke(sql, podaci);
    return true;
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
}
