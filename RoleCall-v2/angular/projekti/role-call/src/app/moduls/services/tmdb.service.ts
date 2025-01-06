import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class TmdbService {

  async pretrazi(query: string, stranica: number) {
    const jwtResponse = await fetch(`${environment.restServis}app/getJWT`);
    const jwtData = await jwtResponse.json();
    const jwtToken = jwtData.token;

    const url = `${environment.restServis}app/pretrazi?query=${encodeURIComponent(query)}&stranica=${stranica}`;
    try {
      const odgovor = await fetch(url, {
        headers: {
          'Authorization': jwtToken,
          'Content-Type': 'application/json',
        },
      });
      if (odgovor.ok) {
        return await odgovor.json();
      } else {
        throw new Error(`Greška: ${odgovor.status}`);
      }
    } catch (error) {
      console.error('Greška prilikom dohvaćanja osoba:', error);
      throw new Error('Došlo je do greške prilikom dohvaćanja podataka!');
    }
  }
}
