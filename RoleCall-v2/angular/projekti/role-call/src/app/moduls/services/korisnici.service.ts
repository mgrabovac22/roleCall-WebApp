import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { Korisnik } from '../interfaces/iKorisnikService';

@Injectable({
  providedIn: 'root',
})
export class KorisniciService {
  constructor() {}

  async getJWT(): Promise<string> {
    const response = await fetch(`${environment.restServis}app/getJWT`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data.token;
  }

  async dohvatiKorisnike(): Promise<{ korisnici: any[]; trenutniKorisnik: any }> {
    try {
      const jwtToken = await this.getJWT();

      const [korisniciResponse, trenutniResponse] = await Promise.all([
        fetch(`${environment.restServis}app/korisnici`, {
          headers: {
            Authorization: jwtToken,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${environment.restServis}app/korisnici/dajTrenutnogKorisnika`, {
          headers: {
            Authorization: jwtToken,
            'Content-Type': 'application/json',
          },
        }),
      ]);

      if (korisniciResponse.ok && trenutniResponse.ok) {
        const korisnici = await korisniciResponse.json();
        const trenutniKorisnik = await trenutniResponse.json();
        return { korisnici, trenutniKorisnik };
      } else {
        throw new Error('Neuspješno dohvaćanje korisnika');
      }
    } catch (error) {
      console.error('Greška prilikom dohvaćanja korisnika:', error);
      throw error;
    }
  }

  async dajPristup(id: number): Promise<void> {
    try {
      const jwtToken = await this.getJWT();

      const response = await fetch(`${environment.restServis}app/korisnici/${id}/dajPristup`, {
        method: 'PUT',
        headers: {
          Authorization: jwtToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Neuspješno davanje pristupa');
      }
    } catch (error) {
      console.error('Greška prilikom davanja pristupa:', error);
      throw error;
    }
  }

  async zabraniPristup(id: number): Promise<void> {
    try {
      const jwtToken = await this.getJWT();

      const response = await fetch(`${environment.restServis}app/korisnici/${id}/zabraniPristup`, {
        method: 'PUT',
        headers: {
          Authorization: jwtToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Neuspješno zabrana pristupa');
      }
    } catch (error) {
      console.error('Greška prilikom zabrane pristupa:', error);
      throw error;
    }
  }

  async dodajNaServis(korisnik: Korisnik): Promise<void> {
    try {
      const jwtToken = await this.getJWT();

      const body = JSON.stringify({
        korime: korisnik.korime,
        tip_korisnika_id: "1",
        status: "Ima pristup"
      });      

      const response = await fetch(`${environment.restServis}korisnici`, {
        method: 'POST',
        headers: {
          Authorization: jwtToken,
          'Content-Type': 'application/json',
        },
        body
      });      

      if (!response.ok) {
        throw new Error('Neuspješno dodavanje sa servisa');
      }

    } catch (error) {
      console.error('Greška prilikom dodavanja:', error);
      throw error;
    }
  }

  async obrisiSaServisa(korime: string): Promise<void> {
    try {
      const jwtToken = await this.getJWT();

      const responseDelete = await fetch(`${environment.restServis}korisnici/${korime}`, {
        method: 'DELETE',
        headers: {
          Authorization: jwtToken,
          'Content-Type': 'application/json',
        },
      });

      if (!responseDelete.ok) {
        throw new Error('Neuspješno brisanje sa servisa pristupa');
      }

    } catch (error) {
      console.error('Greška prilikom zabrane pristupa:', error);
      throw error;
    }
  }

  async obrisiKorisnika(id: number): Promise<void> {
    try {
      const jwtToken = await this.getJWT();

      const response = await fetch(`${environment.restServis}app/korisnici/${id}/obrisi`, {
        method: 'DELETE',
        headers: {
          Authorization: jwtToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Neuspješno brisanje korisnika');
      }
    } catch (error) {
      console.error('Greška prilikom brisanja korisnika:', error);
      throw error;
    }
  }

  async dohvatiPodatkeKorisnika(): Promise<any> {
    try {
      const jwtToken = await this.getJWT();
      const response = await fetch(`${environment.restServis}app/korisnici/dajTrenutnogKorisnika`, {
        method: 'GET',
        headers: {
          Authorization: jwtToken,
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) throw new Error('Greška prilikom dohvaćanja podataka korisnika.');
      
      return response.json();
    } catch (err) {
      console.error('Greška prilikom dohvaćanja podataka korisnika:', err);
      throw err;
    }
  }

  async posaljiZahtjevAdminu(): Promise<void> {
    try {
      const jwtToken = await this.getJWT();
      const response = await fetch(`${environment.restServis}app/korisnici/posaljiZahtjev`, {
        method: 'POST',
        headers: {
          Authorization: jwtToken,
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) throw new Error('Greška prilikom slanja zahtjeva.');
    } catch (err) {
      console.error('Greška prilikom slanja zahtjeva:', err);
      throw err;
    }
  }

  async activateTOTP(): Promise<{ tajniKljuc: string }> {
    const jwtToken = await this.getJWT();
  
    const responseTrenutni = await fetch(`${environment.restServis}app/korisnici/dajTrenutnogKorisnika`, {
      method: 'GET',
      headers: {
        Authorization: jwtToken,
        'Content-Type': 'application/json',
      },
    });
  
    if (!responseTrenutni.ok) throw new Error('Greška prilikom dohvaćanja trenutnog korisnika.');
  
    const trenutniKorisnik = await responseTrenutni.json();
  
    const response = await fetch(`${environment.restServis}app/korisnici/${trenutniKorisnik.korime}/aktiviraj-totp`, {
      method: 'POST',
      headers: {
        Authorization: jwtToken,
        'Content-Type': 'application/json',
      },
    });
  
    if (!response.ok) throw new Error('Greška prilikom aktivacije TOTP.');
  
    const result = await response.json();
  
    return result;
  }
  
  async deactivateTOTP(): Promise<void> {
    const jwtToken = await this.getJWT();
  
    const responseTrenutni = await fetch(`${environment.restServis}app/korisnici/dajTrenutnogKorisnika`, {
      method: 'GET',
      headers: {
        Authorization: jwtToken,
        'Content-Type': 'application/json',
      },
    });
  
    if (!responseTrenutni.ok) throw new Error('Greška prilikom dohvaćanja trenutnog korisnika.');
  
    const trenutniKorisnik = await responseTrenutni.json();
  
    const response = await fetch(`${environment.restServis}app/korisnici/${trenutniKorisnik.korime}/deaktiviraj-totp`, {
      method: 'POST',
      headers: {
        Authorization: jwtToken,
        'Content-Type': 'application/json',
      },
    });
  
    if (!response.ok) throw new Error('Greška prilikom deaktivacije TOTP.');
  }

  async provjeriTOTPStatus(): Promise<boolean> {
    try {
      const jwtToken = await this.getJWT();
    
      const trenutniKorisnik = await this.dohvatiPodatkeKorisnika();
      
      const totpStatusResponse = await fetch(`${environment.restServis}app/korisnici/${trenutniKorisnik.korime}/totp-status`, {
        method: 'GET',
        headers: {
          Authorization: jwtToken,
          'Content-Type': 'application/json',
        },
      });
  
      if (!totpStatusResponse.ok) throw new Error('Greška prilikom dohvaćanja statusa TOTP-a.');
  
      const totpStatus = await totpStatusResponse.json();
    
      return totpStatus.status; 
     
    } catch (error) {
      console.error('Greška prilikom provjere TOTP statusa:', error);
      throw error;
    }
  }
  
}
