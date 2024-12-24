import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class FilmoviService {

  constructor() { }

  async getJWT(): Promise<string> {
    const response = await fetch(`${environment.restServis}app/getJWT`);
    const data = await response.json();
    return data.token;
  }

  async dohvatiFilmove(stranica: number, datumOd?: number, datumDo?: number): Promise<any[]> {
    try {
      const jwtToken = await this.getJWT();
      const queryParams = new URLSearchParams({
        stranica: stranica.toString(),
        ...(datumOd && { datumOd: datumOd.toString() }),
        ...(datumDo && { datumDo: datumDo.toString() }),
      });
      console.log("da vidimo", queryParams);
      

      const response = await fetch(`${environment.restServis}film?${queryParams.toString()}`, {
        headers: {
          "Authorization": jwtToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Greška prilikom dohvaćanja filmova.');

      return await response.json();
    } catch (error) {
      console.error('Greška prilikom dohvaćanja filmova:', error);
      throw error;
    }
  }


  async dohvatiFilmoveIzBaze(idOsobe: number, trenutnaStranica: number): Promise<any[]> {
    try{
      const jwtToken = await this.getJWT();

      const response = await fetch(`${environment.restServis}osoba/${idOsobe}/film?stranica=${trenutnaStranica}`, {
        headers: {
          Authorization: jwtToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Greška prilikom dohvaćanja filmova iz baze.');

      const filmovi = await response.json();
      return filmovi;
    } catch (error) {
      console.error('Greška prilikom dohvaćanja detalja osobe:', error);
      throw error;
    }
  }

  async dohvatiFilmoveSaTMDB(idOsobe: number, dodatnaStranica: number): Promise<any[]> {
    try{
      const jwtToken = await this.getJWT();

      const response = await fetch(`${environment.restServis}app/${idOsobe}/filmoviTmdb?stranica=${dodatnaStranica}`, {
        headers: {
          Authorization: jwtToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Greška prilikom dohvaćanja filmova sa TMDB.');

      const filmovi = await response.json();
      return filmovi.filmovi;
    } catch (error) {
      console.error('Greška prilikom dohvaćanja detalja osobe:', error);
      throw error;
    }
  }
}
