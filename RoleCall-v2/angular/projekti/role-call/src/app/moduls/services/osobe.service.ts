import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class OsobeService {

  constructor() { }

  async getJWT(): Promise<string> {
    const response = await fetch(`${environment.restServis}app/getJWT`);
    const data = await response.json();
    return data.token;
  }

  async dohvatiOsobe(trenutnaStranica: number): Promise<any> {
    try{
      var jwtToken = await this.getJWT();
  
      const response = await fetch(
        `${environment.restServis}osoba?stranica=${trenutnaStranica}`,
        {
          headers: {
            'Authorization': jwtToken,
            'Content-Type': 'application/json',
          }
        }
      );
  
      if (!response.ok) throw new Error(`Greška prilikom dohvaćanja stranice ${trenutnaStranica}.`);
  
      return await response.json();
    } catch(err){
      console.log("Error: ", err);
    }
  }

  async dohvatiDetaljeOsobe(idOsobe: number): Promise<any> {
    try {
      const jwtToken = await this.getJWT();

      const response = await fetch(`${environment.restServis}osoba/${idOsobe}`, {
        headers: {
          Authorization: jwtToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Greška prilikom dohvaćanja detalja osobe.');
      return await response.json();
    } catch (error) {
      console.error('Greška prilikom dohvaćanja detalja osobe:', error);
      throw error;
    }
  }

  async provjeriPostojanje(id: number): Promise<boolean> {
    const url = `${environment.restServis}app/provjeriPostojanje/${id}`;
    try {
      const jwtToken = await this.getJWT();

      const odgovor = await fetch(url, {
        headers: {
          'Authorization': jwtToken,
        },
      });
      return odgovor.ok;
    } catch (error) {
      console.error(`Greška prilikom provjere osobe ID ${id}:`, error);
      return false;
    }
  }

  async dodajOsobu(bodyParse: any) {
    const url = `${environment.restServis}app/osobaFilmovi`;
  
    const body = bodyParse;
  
    try {
      const jwtToken = await this.getJWT();
  
      const odgovor = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': jwtToken,
          'Content-Type': 'application/json',
        },
        body,
      });
  
      if (odgovor.ok) {
        return true;
      } else {
        const greska = await odgovor.json();
        throw new Error(greska.greska || `Greška: ${odgovor.status}`);
      }
    } catch (error) {
      console.error('Greška prilikom dodavanja osobe:', error);
      throw new Error('Došlo je do greške prilikom dodavanja osobe!');
    }
  }
  
  async brisiOsobu(id: number) {
    try {
      const jwtToken = await this.getJWT();
  
      const url = `${environment.restServis}app/osobaFilmovi/${id}`;
      const odgovor = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': jwtToken,
          'Content-Type': 'application/json',
        },
      });
  
      if (odgovor.ok) {
        return true;
      } else {
        const greska = await odgovor.json();
        throw new Error(greska.greska || `Greška: ${odgovor.status}`);
      }
    } catch (error) {
      console.error('Greška prilikom brisanja osobe:', error);
      throw new Error('Došlo je do greške prilikom brisanja!');
    }
  }
}
