import { Osoba, Film, FilmOsoba, Slika } from "../../iServis/iTmdb.js";
import Baza from "../db/bazaSQLite.js";
import path from "path";
import { __dirname } from "../../moduli/okolinaUtils.js";

export class OsobaDAO {
  private baza: Baza;

  constructor() {
    const apsolutnaPutanja = path.resolve(__dirname(), "../../../podaci/RWA2024mgrabovac22_servis.sqlite");
    this.baza = new Baza(apsolutnaPutanja);
  }

  async dodaj(osoba: Osoba): Promise<boolean> {
    if (!osoba.ime_prezime || !osoba.izvor_poznatosti || !osoba.putanja_profila) {
      throw new Error("Nedostaju obavezni podaci za dodavanje osobe.");
    }

    const sql = `
      INSERT INTO osoba (ime_prezime, izvor_poznatosti, putanja_profila, rang_popularnosti)
      VALUES (?, ?, ?, ?)
    `;
    const podaci = [osoba.ime_prezime, osoba.izvor_poznatosti, osoba.putanja_profila, osoba.rang_popularnosti];

    await this.baza.ubaciAzurirajPodatke(sql, podaci);
    return true;
  }

  async obrisi(id: number): Promise<boolean> {
    if (!id) {
      throw new Error("ID je obavezan za brisanje osobe.");
    }

    const sqlOsoba = "DELETE FROM osoba WHERE id = ?";
    const sqlVeze = "DELETE FROM film_osoba WHERE osoba_id = ?";

    await this.baza.ubaciAzurirajPodatke(sqlVeze, [id]);
    await this.baza.ubaciAzurirajPodatke(sqlOsoba, [id]);

    return true;
  }

  async dajSvePoStranici(stranica: number): Promise<Osoba[]> {
    const limit = 20;
    const offset = (stranica - 1) * limit;

    const sql = "SELECT * FROM osoba LIMIT ? OFFSET ?";
    const podaci = (await this.baza.dajPodatkePromise(sql, [limit, offset])) as Array<any>;

    return podaci.map((p) => ({
      id: p.id,
      ime_prezime: p.ime_prezime,
      izvor_poznatosti: p.izvor_poznatosti,
      putanja_profila: p.putanja_profila,
      rang_popularnosti: p.rang_popularnosti,
    }));
  }

  async daj(id: number): Promise<Osoba | null> {
    if (!id) {
      throw new Error("ID je obavezan za dohvaćanje osobe.");
    }

    const sql = "SELECT * FROM osoba WHERE id = ?";
    const podaci = (await this.baza.dajPodatkePromise(sql, [id])) as Array<any>;

    if (podaci.length === 1) {
      const p = podaci[0];
      return {
        id: p.id,
        ime_prezime: p.ime_prezime,
        izvor_poznatosti: p.izvor_poznatosti,
        putanja_profila: p.putanja_profila,
        rang_popularnosti: p.rang_popularnosti,
      };
    }

    return null;
  }

  async dajFilmoveOsobe(id: number, stranica: number): Promise<Film[]> {
    const limit = 20;
    const offset = (stranica - 1) * limit;

    const sql = `
      SELECT f.*
      FROM film f
      JOIN film_osoba fo ON f.id = fo.film_id
      WHERE fo.osoba_id = ?
      LIMIT ? OFFSET ?
    `;
    const podaci = (await this.baza.dajPodatkePromise(sql, [id, limit, offset])) as Array<any>;

    return podaci.map((p) => ({
      id: p.id,
      jezik: p.jezik,
      org_naslov: p.org_naslov,
      naslov: p.naslov,
      rang_popularnosti: p.rang_popularnosti,
      putanja_postera: p.putanja_postera,
      datum_izdavanja: p.datum_izdavanja,
      opis: p.opis,
    }));
  }

  async poveziOsobuFilmove(osobaId: number, filmovi: FilmOsoba[]): Promise<boolean> {
    const sql = `
      INSERT INTO film_osoba (film_id, osoba_id, lik)
      VALUES (?, ?, ?)
    `;

    for (const film of filmovi) {
      await this.baza.ubaciAzurirajPodatke(sql, [film.film_id, osobaId, film.lik]);
    }

    return true;
  }

  async obrisiVezeOsobaFilmove(osobaId: number, filmovi: number[]): Promise<boolean> {
    const sql = `
      DELETE FROM film_osoba
      WHERE osoba_id = ? AND film_id = ?
    `;

    for (const filmId of filmovi) {
      await this.baza.ubaciAzurirajPodatke(sql, [osobaId, filmId]);
    }

    return true;
  }

  async dajSlikeOsobe(id: number): Promise<Slika[]> {
    const sql = `
      SELECT * FROM slika
      WHERE osoba_id = ?
    `;
    const podaci = await this.baza.dajPodatkePromise(sql, [id]) as Array<any>;

    return podaci.map((p: any) => ({
      id: p.id,
      putanja_do_slike: p.putanja_do_slike,
      osoba_id: p.osoba_id,
    }));
  }

  async dodajSliku(slika: Slika): Promise<boolean> {
    const sql = `
      INSERT INTO slika (putanja_do_slike, osoba_id)
      VALUES (?, ?)
    `;
    await this.baza.ubaciAzurirajPodatke(sql, [slika.putanja_do_slike, slika.osoba_id]);
    return true;
  }
}
