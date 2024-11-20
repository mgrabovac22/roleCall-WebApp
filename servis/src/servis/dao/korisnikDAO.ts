import { Korisnik } from "../../iServis/iKorisnik.js";
import Baza from "../db/bazaSQLite.js";
import path from "path";
import { __dirname } from "../../moduli/okolinaUtils.js";

export class KorisnikDAO {
  private baza: Baza;

  constructor() {
    const apsolutnaPutanja = path.resolve(__dirname(), "../../../podaci/RWA2024mgrabovac22_servis.sqlite");
    this.baza = new Baza(apsolutnaPutanja);
  }

  async dodaj(korisnik: Korisnik): Promise<boolean> {
    if (!korisnik.korime || !korisnik.status || !korisnik.korisnici_id) {
      throw new Error("Nedostaju obavezni podaci za dodavanje korisnika.");
    }

    const sql = `
      INSERT INTO korisnik (korime, status, Korisnici_id)
      VALUES (?, ?, ?)
    `;
    const podaci = [korisnik.korime, korisnik.status, korisnik.korisnici_id];

    await this.baza.ubaciAzurirajPodatke(sql, podaci);
    return true;
  }

  async obrisi(korime: string): Promise<boolean> {
    if (!korime) {
      throw new Error("Korisničko ime je obavezno za brisanje korisnika.");
    }

    const sql = "DELETE FROM korisnik WHERE korime = ?";
    await this.baza.ubaciAzurirajPodatke(sql, [korime]);
    return true;
  }

  async dajSve(): Promise<Korisnik[]> {
    const sql = "SELECT * FROM korisnik;";
    const podaci = (await this.baza.dajPodatkePromise(sql, [])) as Array<any>;

    return podaci.map((p) => ({
      id: p.id,
      korime: p.korime,
      status: p.status,
      korisnici_id: p.Korisnici_id,
    }));
  }

  async daj(korime: string): Promise<Korisnik | null> {
    if (!korime) {
      throw new Error("Korisničko ime je obavezno za dohvaćanje korisnika.");
    }

    const sql = "SELECT * FROM korisnik WHERE korime = ?";
    const podaci = (await this.baza.dajPodatkePromise(sql, [korime])) as Array<any>;

    if (podaci.length === 1) {
      const p = podaci[0];
      return {
        id: p.id,
        korime: p.korime,
        status: p.status,
        korisnici_id: p.Korisnici_id,
      };
    }

    return null;
  }
}
