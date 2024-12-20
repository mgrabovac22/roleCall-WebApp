import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';

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
}
