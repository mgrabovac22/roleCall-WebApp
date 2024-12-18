import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment.prod';

@Component({
  selector: 'app-korisnici',
  templateUrl: './korisnici.component.html',
  standalone: false,
  styleUrls: ['./korisnici.component.scss']
})
export class KorisniciComponent implements OnInit {
  korisnici: any[] = [];
  trenutniKorisnik: any = null;
  poruka: string = '';

  ngOnInit(): void {
    this.dohvatiKorisnike();
  }

  async dohvatiKorisnike(): Promise<void> {
    try {
      const jwtResponse = await fetch(`${environment.restServis}app/getJWT`);
      const jwtData = await jwtResponse.json();
      const jwtToken = jwtData.token;

      const korisniciResponse = await fetch(`${environment.restServis}app/korisnici`, {
        headers: {
          'Authorization': jwtToken,
          'Content-Type': 'application/json',
        },
      });

      const trenutniResponse = await fetch(`${environment.restServis}app/korisnici/dajTrenutnogKorisnika`, {
        headers: {
          'Authorization': jwtToken,
          'Content-Type': 'application/json',
        },
      });

      if (korisniciResponse.ok && trenutniResponse.ok) {
        this.korisnici = await korisniciResponse.json();
        this.trenutniKorisnik = await trenutniResponse.json();
      } else {
        throw new Error('Neuspješno dohvaćanje korisnika');
      }
    } catch (error) {
      console.error('Greška prilikom dohvaćanja korisnika:', error);
      this.poruka = 'Došlo je do greške prilikom dohvaćanja korisnika!';
    }
  }

  async dajPristup(id: number): Promise<void> {
    try {
      const jwtResponse = await fetch(`${environment.restServis}app/getJWT`);
      const jwtData = await jwtResponse.json();
      const jwtToken = jwtData.token;

      const response = await fetch(`${environment.restServis}app/korisnici/${id}/dajPristup`, {
        method: 'PUT',
        headers: {
          'Authorization': jwtToken,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        alert('Pristup je omogućen korisniku.');
        await this.dohvatiKorisnike();
      } else {
        throw new Error('Neuspješno davanje pristupa');
      }
    } catch (error) {
      console.error('Greška prilikom davanja pristupa:', error);
      this.poruka = 'Došlo je do greške prilikom davanja pristupa korisniku!';
    }
  }

  async zabraniPristup(id: number): Promise<void> {
    const potvrda = confirm('Jeste li sigurni da želite zabraniti pristup korisniku?');
    if (!potvrda) return;

    try {
      const jwtResponse = await fetch(`${environment.restServis}app/getJWT`);
      const jwtData = await jwtResponse.json();
      const jwtToken = jwtData.token;

      const response = await fetch(`${environment.restServis}app/korisnici/${id}/zabraniPristup`, {
        method: 'PUT',
        headers: {
          'Authorization': jwtToken,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        alert('Pristup je zabranjen korisniku.');
        await this.dohvatiKorisnike();
      } else {
        throw new Error('Neuspješno zabrana pristupa');
      }
    } catch (error) {
      console.error('Greška prilikom zabrane pristupa:', error);
      this.poruka = 'Došlo je do greške prilikom zabrane pristupa korisniku!';
    }
  }

  async obrisiKorisnika(id: number): Promise<void> {
    const potvrda = confirm('Jeste li sigurni da želite obrisati korisnika?');
    if (!potvrda) return;

    try {
      const jwtResponse = await fetch(`${environment.restServis}app/getJWT`);
      const jwtData = await jwtResponse.json();
      const jwtToken = jwtData.token;

      const response = await fetch(`${environment.restServis}korisnici/${id}/obrisi`, {
        method: 'DELETE',
        headers: {
          'Authorization': jwtToken,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        alert('Korisnik je uspješno obrisan.');
        await this.dohvatiKorisnike();
      } else {
        throw new Error('Neuspješno brisanje korisnika');
      }
    } catch (error) {
      console.error('Greška prilikom brisanja korisnika:', error);
      this.poruka = 'Došlo je do greške prilikom brisanja korisnika!';
    }
  }

  prikaziStatus(boja: string): string {
    switch (boja) {
      case 'Poslan zahtjev':
        return 'yellow';
      case 'Zabranjen mu je pristup':
        return 'red';
      case 'Nije poslan zahtjev':
        return 'orange';
      default:
        return 'green';
    }
  }
}
