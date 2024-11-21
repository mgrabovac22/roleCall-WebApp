import { Film } from "../../iServis/iTmdb.js";
import Baza from "../db/bazaSQLite.js";
import path from "path";
import { __dirname } from "../../moduli/okolinaUtils.js";

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
  
    if (datumOd && datumDo) {
      sql += " WHERE datum_izdavanja BETWEEN ? AND ?";
      podaci.push(datumOd, datumDo);
    }
  
    sql += " LIMIT ? OFFSET ?";
    podaci.push(limit, offset);
  
    const filmovi = (await this.baza.dajPodatkePromise(sql, podaci)) as Array<{
      id: number;
      jezik: string;
      org_naslov: string;
      naslov: string;
      rang_popularnosti: number | null;
      putanja_postera: string | null;
      datum_izdavanja: string;
      opis: string | null;
    }>;
  
    return filmovi.map((p) => ({
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
      INSERT INTO film (jezik, org_naslov, naslov, rang_popularnosti, putanja_postera, datum_izdavanja, opis)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const podaci = [
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

  // Dohvatanje jednog filma prema ID-u
  /*async dajFilm(id: number): Promise<Film | null> {
    const sql = "SELECT * FROM film WHERE id = ?";
    const podaci = await this.baza.dajPodatkePromise(sql, [id]);

    if (podaci.length === 1) {
      const p = podaci[0];
      return {
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

  // Brisanje filma ako nema više veza
  async obrisiFilm(id: number): Promise<boolean> {
    const sqlVeze = "SELECT COUNT(*) as veze FROM film_osoba WHERE film_id = ?";
    const sqlBrisanje = "DELETE FROM film WHERE id = ?";

    const veze = await this.baza.dajPodatkePromise(sqlVeze, [id]);
    if (veze[0].veze > 0) {
      throw new Error("Film ima povezane osobe i ne može biti obrisan.");
    }

    await this.baza.ubaciAzurirajPodatke(sqlBrisanje, [id]);
    return true;
  }*/
}
