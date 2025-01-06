import { Component, OnInit } from '@angular/core';
import { KorisniciService } from '../../moduls/services/korisnici.service';
import { Korisnik } from '../../moduls/interfaces/iKorisnikService';
import { SnijegService } from '../../moduls/services/snijeg.service';

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
  prikaziModal: boolean = false;
  korisnikZaBrisanje: { id: number; korime: string; ime: string; status: string } | null = null;

  intenzitetSnijega: number = 20;
  snowflakes: { duration: number; left: number }[] = [];

  constructor(private korisniciService: KorisniciService, private snowflakesService: SnijegService) {}

  ngOnInit(): void {
    this.snowflakesService.intenzitetSnijega$.subscribe((intenzitet) => {
      this.intenzitetSnijega = intenzitet;
      this.generateSnowflakes();
    });
    this.dohvatiKorisnike();
  }

  private generateSnowflakes(): void {
    this.snowflakes = Array.from({ length: this.intenzitetSnijega }, () => ({
      duration: Math.random() * 5 + 5,
      left: Math.random() * 100,
    }));
  }

  async dohvatiKorisnike(): Promise<void> {
    try {
      const { korisnici, trenutniKorisnik } = await this.korisniciService.dohvatiKorisnike();
      this.korisnici = korisnici;
      this.trenutniKorisnik = trenutniKorisnik;
    } catch (error) {
      this.poruka = 'Došlo je do greške prilikom dohvaćanja korisnika!';
    }
  }

  async dajPristup(id: number, korisnikFull: any): Promise<void> {
    try {
      const korisnik: Korisnik = {
        id: null,
        korime: korisnikFull.korime,
        status: korisnikFull.status,
        tip_korisnika: korisnikFull.tip_korisnika_id
      };
      await this.korisniciService.dodajNaServis(korisnik);
      await this.korisniciService.dajPristup(id);
      await this.dohvatiKorisnike();
    } catch (error) {
      this.poruka = 'Došlo je do greške prilikom davanja pristupa korisniku!';
    }
  }

  async zabraniPristup(id: number, korime: string): Promise<void> {
    try {
      await this.korisniciService.zabraniPristup(id);
      await this.korisniciService.obrisiSaServisa(korime);
      await this.dohvatiKorisnike();
    } catch (error) {
      this.poruka = 'Došlo je do greške prilikom zabrane pristupa korisniku!';
    }
  }

  prikaziModalZaBrisanje(id: number, ime: string, korime: string, status: string): void {
    this.korisnikZaBrisanje = { id, korime, ime, status };
    this.prikaziModal = true;
  }

  async potvrdiBrisanje(): Promise<void> {
    if (this.korisnikZaBrisanje) {
      try {
        await this.korisniciService.obrisiKorisnika(this.korisnikZaBrisanje.id);
        if (this.korisnikZaBrisanje.status === 'Ima pristup') {
          await this.korisniciService.obrisiSaServisa(this.korisnikZaBrisanje.korime);
        }
        await this.dohvatiKorisnike();
      } catch (error) {
        this.poruka = 'Došlo je do greške prilikom brisanja korisnika!';
      } finally {
        this.zatvoriModal();
      }
    }
  }

  zatvoriModal(): void {
    this.prikaziModal = false;
    this.korisnikZaBrisanje = null;
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
