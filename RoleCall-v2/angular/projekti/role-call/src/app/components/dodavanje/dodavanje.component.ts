import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { TmdbService } from '../../moduls/services/tmdb.service';
import { OsobeService } from '../../moduls/services/osobe.service';
import { SnijegService } from '../../moduls/services/snijeg.service';

@Component({
  selector: 'app-dodavanje',
  templateUrl: './dodavanje.component.html',
  standalone: false,
  styleUrls: ['./dodavanje.component.scss'],
})
export class DodavanjeComponent implements OnInit {
  query: string = '';
  poruka: string = '';
  currentPage = 1;
  totalPages = 1;
  osobe: any[] = [];
  dodavanjeStatus: { [key: number]: boolean } = {};
  brisanjeStatus: { [key: number]: boolean } = {};

  intenzitetSnijega: number = 20;
  snowflakes: { duration: number; left: number }[] = [];

  constructor(private tmdbService: TmdbService, private osobeService: OsobeService, private snowflakesService: SnijegService){}
  
  ngOnInit(): void {
    this.snowflakesService.intenzitetSnijega$.subscribe((intenzitet) => {
      this.intenzitetSnijega = intenzitet;
      this.generateSnowflakes();
    });
  }

  private generateSnowflakes(): void {
    this.snowflakes = Array.from({ length: this.intenzitetSnijega }, () => ({
      duration: Math.random() * 5 + 5,
      left: Math.random() * 100,
    }));
  }


  async pretrazi() {
    if (this.query.length >= 3) {
      this.poruka = '';
      await this.dajOsobe(1);
    } else {
      this.poruka = 'Unesite barem 3 znaka za pretragu!';
    }
  }

  async dajOsobe(stranica: number) {
  
    try {
      const odgovor = await this.tmdbService.pretrazi(this.query, stranica);
      if (odgovor!=null) {
        const podaci = odgovor;
        this.totalPages = podaci.total_pages;
        this.currentPage = podaci.page;
  
        this.osobe = await Promise.all(
          podaci.results.map(async (osoba: any) => {
            const postoji = await this.osobeService.provjeriPostojanje(osoba.id);
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
  
  async provjeriPostojanje(id: number): Promise<boolean> {
    try {
      const odgovor = await this.osobeService.provjeriPostojanje(id);
      return odgovor;
    } catch (error) {
      console.error(`Greška prilikom provjere osobe ID ${id}:`, error);
      return false;
    }
  }
  

  async dodajOsobu(id: number, ime: string, izvor_poznatosti: string, putanja_profila: string, rang_popularnosti: any) {
    this.dodavanjeStatus[id] = true; 
  
    const body = JSON.stringify({
      id,
      ime_prezime: ime,
      izvor_poznatosti,
      putanja_profila: environment.slikePutanja + putanja_profila,
      rang_popularnosti,
    });
  
    try {
      var odgovor = await this.osobeService.dodajOsobu(body)
  
      if (odgovor) {
        await this.dajOsobe(this.currentPage);
      } else {
        const greska = "Nije uspjelo dodavanje osobe!";
        throw new Error(greska);
      }
    } catch (error) {
      console.error('Greška prilikom dodavanja osobe:', error);
      this.poruka = 'Došlo je do greške prilikom dodavanja osobe!';
    } finally {
      this.dodavanjeStatus[id] = false; 
    }
  }
  
  async brisiOsobu(id: number) {
  
    this.brisanjeStatus[id] = true; 
  
    try {
      var odgovor = await this.osobeService.brisiOsobu(id);
  
      if (odgovor) {
        await this.dajOsobe(this.currentPage);
      } else {
        const greska = "Nije uspjelo brisanje osobe!";
        throw new Error(greska);
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
