import { Component } from '@angular/core';
import { environment } from '../../environments/environment.prod';

@Component({
  selector: 'app-dodavanje',
  templateUrl: './dodavanje.component.html',
  standalone: false,
  styleUrls: ['./dodavanje.component.scss'],
})
export class DodavanjeComponent {
  query: string = '';
  poruka: string = '';
  currentPage = 1;
  totalPages = 1;
  osobe: any[] = [];
  dodavanjeStatus: { [key: number]: boolean } = {};
  brisanjeStatus: { [key: number]: boolean } = {};


  async pretrazi() {
    if (this.query.length >= 3) {
      this.poruka = '';
      await this.dajOsobe(1);
    } else {
      this.poruka = 'Unesite barem 3 znaka za pretragu!';
    }
  }

  async dajOsobe(stranica: number) {
    const jwtResponse = await fetch(`${environment.restServis}app/getJWT`);
    const jwtData = await jwtResponse.json();
    const jwtToken = jwtData.token;
  
    const url = `${environment.restServis}app/pretrazi?query=${encodeURIComponent(this.query)}&stranica=${stranica}`;
    try {
      const odgovor = await fetch(url, {
        headers: {
          'Authorization': jwtToken,
          'Content-Type': 'application/json',
        },
      });
      if (odgovor.ok) {
        const podaci = await odgovor.json();
        this.totalPages = podaci.total_pages;
        this.currentPage = podaci.page;
  
        this.osobe = await Promise.all(
          podaci.results.map(async (osoba: any) => {
            const postoji = await this.provjeriPostojanje(osoba.id, jwtToken);
            return { ...osoba, postojiUBazi: postoji };
          })
        );
      } else {
        throw new Error(`Greška: ${odgovor.status}`);
      }
    } catch (error) {
      console.error('Greška prilikom dohvaćanja osoba:', error);
      this.poruka = 'Došlo je do greške prilikom dohvaćanja podataka!';
    }
  }
  
  async provjeriPostojanje(id: number, jwtToken: string): Promise<boolean> {
    const url = `${environment.restServis}app/provjeriPostojanje/${id}`;
    try {
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
  

  async dodajOsobu(id: number, ime: string, izvor_poznatosti: string, putanja_profila: string, rang_popularnosti: any) {
    this.dodavanjeStatus[id] = true; 
    const url = `${environment.restServis}app/osobaFilmovi`;
  
    const body = JSON.stringify({
      id,
      ime_prezime: ime,
      izvor_poznatosti,
      putanja_profila: environment.slikePutanja + putanja_profila,
      rang_popularnosti,
    });
  
    try {
      const jwtResponse = await fetch(`${environment.restServis}app/getJWT`);
      const jwtData = await jwtResponse.json();
      const jwtToken = jwtData.token;
  
      const odgovor = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': jwtToken,
          'Content-Type': 'application/json',
        },
        body,
      });
  
      if (odgovor.ok) {
        await this.dajOsobe(this.currentPage);
      } else {
        const greska = await odgovor.json();
        throw new Error(greska.greska || `Greška: ${odgovor.status}`);
      }
    } catch (error) {
      console.error('Greška prilikom dodavanja osobe:', error);
      this.poruka = 'Došlo je do greške prilikom dodavanja osobe!';
    } finally {
      this.dodavanjeStatus[id] = false; 
    }
  }
  
  async brisiOsobu(id: number, ime: string) {
  
    this.brisanjeStatus[id] = true; 
  
    try {
      const jwtResponse = await fetch(`${environment.restServis}app/getJWT`);
      const jwtData = await jwtResponse.json();
      const jwtToken = jwtData.token;
  
      const url = `${environment.restServis}app/osobaFilmovi/${id}`;
      const odgovor = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': jwtToken,
          'Content-Type': 'application/json',
        },
      });
  
      if (odgovor.ok) {
        await this.dajOsobe(this.currentPage);
      } else {
        const greska = await odgovor.json();
        throw new Error(greska.greska || `Greška: ${odgovor.status}`);
      }
    } catch (error) {
      console.error('Greška prilikom brisanja osobe:', error);
      this.poruka = 'Došlo je do greške prilikom brisanja!';
    } finally {
      this.brisanjeStatus[id] = false; 
    }
  }
  

  idiNaStranicu(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.dajOsobe(page);
    }
  }
}
