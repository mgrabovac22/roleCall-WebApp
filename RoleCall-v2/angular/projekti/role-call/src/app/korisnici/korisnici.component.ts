import { Component, OnInit } from '@angular/core';
import { KorisniciService } from '../services/korisnici.service';
import { Korisnik } from '../interfaces/iKorisnikService';

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

  constructor(private korisniciService: KorisniciService) {}

  ngOnInit(): void {
    this.dohvatiKorisnike();
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

  async obrisiKorisnika(id: number, korime: string, status: string): Promise<void> {

    try {
      await this.korisniciService.obrisiKorisnika(id);
      if(status === "Ima pristup"){
        await this.korisniciService.obrisiSaServisa(korime);
      }
      await this.dohvatiKorisnike();
    } catch (error) {
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
