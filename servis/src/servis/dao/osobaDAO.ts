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
    if (!osoba.id || !osoba.ime_prezime || !osoba.izvor_poznatosti || !osoba.putanja_profila) {
      throw new Error("Nedostaju obavezni podaci za dodavanje osobe.");
    }

    const sql = `
      INSERT INTO osoba (id, ime_prezime, izvor_poznatosti, putanja_profila, rang_popularnosti)
      VALUES (?, ?, ?, ?, ?)
    `;
    const podaci = [
      osoba.id,
      osoba.ime_prezime,
      osoba.izvor_poznatosti,
      osoba.putanja_profila,
      osoba.rang_popularnosti,
    ];

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

    const sql = "SELECT row_id, * FROM osoba LIMIT ? OFFSET ?";
    const podaci = (await this.baza.dajPodatkePromise(sql, [limit, offset])) as Array<any>;

    return podaci.map((p) => ({
      row_id: p.row_id,
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

    const sql = "SELECT row_id, * FROM osoba WHERE id = ?";
    const podaci = (await this.baza.dajPodatkePromise(sql, [id])) as Array<any>;

    if (podaci.length === 1) {
      const p = podaci[0];
      return {
        row_id: p.row_id,
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
      SELECT f.row_id, f.*
      FROM film f
      JOIN film_osoba fo ON f.id = fo.film_id
      WHERE fo.osoba_id = ?
      LIMIT ? OFFSET ?
    `;
    const podaci = (await this.baza.dajPodatkePromise(sql, [id, limit, offset])) as Array<any>;

    return podaci.map((p) => ({
      row_id: p.row_id,
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

  async poveziOsobuFilmove(osobaId: number, filmovi: FilmOsoba[]): Promise<void> {
    const sqlProveriFilm = "SELECT COUNT(*) AS broj FROM film WHERE id = ?";
    const sqlProveriOsobu = "SELECT COUNT(*) AS broj FROM osoba WHERE id = ?";
    const sqlDodavanjeVeze = "INSERT INTO film_osoba (film_id, osoba_id, lik) VALUES (?, ?, ?)";

    for (const film of filmovi) {
        const filmPostoji = (await this.baza.dajPodatkePromise(sqlProveriFilm, [film.film_id])) as any;
        const osobaPostoji = (await this.baza.dajPodatkePromise(sqlProveriOsobu, [osobaId])) as any;

        if (filmPostoji[0].broj === 0) {
            throw new Error(`Film s ID-jem ${film.film_id} ne postoji u bazi.`);
        }

        if (osobaPostoji[0].broj === 0) {
            throw new Error(`Osoba s ID-jem ${osobaId} ne postoji u bazi.`);
        }

        await this.baza.ubaciAzurirajPodatke(sqlDodavanjeVeze, [film.film_id, osobaId, film.lik || null]);
    }
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
      SELECT row_id, * FROM slika
      WHERE osoba_id = ?
    `;
    const podaci = (await this.baza.dajPodatkePromise(sql, [id])) as Array<any>;

    return podaci.map((p: any) => ({
      row_id: p.row_id,
      id: p.id,
      putanja_do_slike: p.putanja_do_slike,
      osoba_id: p.osoba_id,
    }));
  }

  async dodajSliku(slika: Slika): Promise<boolean> {
    const sql = `
      INSERT INTO slika (id, putanja_do_slike, osoba_id)
      VALUES (?, ?, ?)
    `;
    await this.baza.ubaciAzurirajPodatke(sql, [slika.id, slika.putanja_do_slike, slika.osoba_id]);
    return true;
  }

  async obrisiSliku(id: number): Promise<void> {
    const sql = `
        DELETE FROM slika
        WHERE osoba_id = ?
    `;

    try {
        await this.baza.ubaciAzurirajPodatke(sql, [id]);
    } catch (err) {
        console.error(`Greška prilikom brisanja slike s ID-jem ${id}:`, err);
        throw new Error(`Neuspješno brisanje slike s ID-jem ${id}`);
    }
  }

  async obrisiSveVezeFilmova(idOsobe: number): Promise<void> {
    const sql = `
        DELETE FROM film_osoba
        WHERE osoba_id = ?
    `;
    try {
        await this.baza.ubaciAzurirajPodatke(sql, [idOsobe]);
        console.log(`Sve veze između filmova i osobe s ID-jem ${idOsobe} su obrisane.`);
    } catch (err) {
        console.error(`Greška prilikom brisanja veza između filmova i osobe s ID-jem ${idOsobe}:`, err);
        throw new Error("Greška prilikom brisanja veza između filmova i osobe.");
    }
  }

  async dajUkupanBrojOsoba(): Promise<number> {
    const sql = "SELECT COUNT(*) as total FROM osoba";
    const rezultat = await this.baza.dajPodatkePromise(sql, []) as any;
    return rezultat[0].total;
  }

}
