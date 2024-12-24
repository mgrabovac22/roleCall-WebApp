import Baza from "../db/bazaSQLite.js";
import path from "path";
import { __dirname } from "../../moduli/okolinaUtils.js";
import { Film } from "../../iServis/iTmdb.js";

export class FilmDAO {
  private baza: Baza;

  constructor() {
    const apsolutnaPutanja = path.resolve(__dirname(), "../../../podaci/RWA2024mgrabovac22_servis.sqlite");
    this.baza = new Baza(apsolutnaPutanja);
  }

  async dajFilmovePoStranici(
    stranica: number,
    datumOd?: string,
    datumDo?: string
  ): Promise<Film[]> {
    const limit = 20;
    const offset = (stranica - 1) * limit;

    let sql = "SELECT * FROM film";
    const podaci: any[] = [];

    if (datumOd || datumDo) {
        sql += " WHERE";
        
        if (datumOd) {
            const datumOdFormat = new Date(parseInt(datumOd)).toISOString().split('T')[0];
            sql += " datum_izdavanja >= ?";
            podaci.push(datumOdFormat);
        }

        if (datumDo) {
            const datumDoFormat = new Date(parseInt(datumDo)).toISOString().split('T')[0];
            if (datumOd) {
                sql += " AND";
            }
            sql += " datum_izdavanja <= ?";
            podaci.push(datumDoFormat);
        }
    }

    sql += " LIMIT ? OFFSET ?";
    podaci.push(limit, offset);

    const filmovi = (await this.baza.dajPodatkePromise(sql, podaci)) as Array<any>;

    return filmovi.map((p) => ({
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


  async dodajFilm(film: Film): Promise<boolean> {
    const sql = `
      INSERT INTO film (id, jezik, org_naslov, naslov, rang_popularnosti, putanja_postera, datum_izdavanja, opis)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const podaci = [
      film.id,
      film.jezik,
      film.org_naslov,
      film.naslov,
      film.rang_popularnosti,
      film.putanja_postera,
      film.datum_izdavanja,
      film.opis,
    ];
    await this.baza.ubaciAzurirajPodatke(sql, podaci);
    return true;
  }

  async dajFilm(id: number): Promise<Film | null> {
    const sql = "SELECT * FROM film WHERE id = ?";
    const podaci = (await this.baza.dajPodatkePromise(sql, [id])) as Array<any>;

    if (podaci.length === 1) {
      const p = podaci[0];
      return {
        row_id: p.row_id,
        id: p.id,
        jezik: p.jezik,
        org_naslov: p.org_naslov,
        naslov: p.naslov,
        rang_popularnosti: p.rang_popularnosti,
        putanja_postera: p.putanja_postera,
        datum_izdavanja: p.datum_izdavanja,
        opis: p.opis,
      };
    }
    return null;
  }

  async obrisiFilm(id: number): Promise<boolean> {
    if (!id) {
        throw new Error("ID filma nije validan.");
    }

    const sqlVeze = "SELECT COUNT(*) as veze FROM film_osoba WHERE film_id = ?";
    const sqlBrisanje = "DELETE FROM film WHERE id = ?";

    const veze = (await this.baza.dajPodatkePromise(sqlVeze, [id])) as Array<any>;

    if (veze.length > 0 && veze[0].veze > 0) {
        throw new Error("Film ima povezane osobe i ne može biti obrisan.");
    }

    try {
        await this.baza.ubaciAzurirajPodatke(sqlBrisanje, [id]);
        console.log(`Film s ID-jem ${id} uspešno obrisan iz baze.`);
        return true;
    } catch (error) {
        console.error(`Greška prilikom brisanja filma s ID-jem ${id}:`, error);
        throw new Error("Došlo je do greške prilikom brisanja filma.");
    }
  }

}
