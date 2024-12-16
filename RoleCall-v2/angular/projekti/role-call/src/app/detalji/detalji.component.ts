import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { environment } from '../../environments/environment.prod';

@Component({
  selector: 'app-detalji',
  templateUrl: './detalji.component.html',
  styleUrls: ['./detalji.component.scss'],
  standalone: true, 
  imports: [CommonModule], 
})
export class DetaljiComponent implements OnInit {
  idOsobe: number | null = null;
  osoba: any = null;
  slike: any[] = [];
  filmovi: any[] = [];
  trenutnaStranicaFilmova: number = 1;
  dodatnaStranicaFilmova: number = 2;
  bazaFilmoviGotova: boolean = false;

  constructor(private route: ActivatedRoute, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(async (params) => {
      this.idOsobe = params.has('id') ? Number(params.get('id')) : null;
      if (this.idOsobe) {
        await this.ucitajDetaljeOsobe();
        await this.ucitajFilmoveIzBaze();
      }
    });
  }

  async ucitajDetaljeOsobe(): Promise<void> {
    try {
      const jwtResponse = await fetch(`${environment.restServis}app/getJWT`);
      const jwtData = await jwtResponse.json();
      const jwtToken = jwtData.token;

      const response = await fetch(`${environment.restServis}osoba/${this.idOsobe}`, {
        headers: {
          Authorization: jwtToken,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Greška prilikom dohvaćanja detalja osobe.');
      this.osoba = await response.json();
      this.slike = this.osoba.slike || [];
    } catch (error) {
      console.error('Greška prilikom učitavanja detalja osobe:', error);
    }
  }

  async ucitajFilmoveIzBaze(): Promise<void> {
    try {
      const jwtResponse = await fetch(`${environment.restServis}app/getJWT`);
      const jwtData = await jwtResponse.json();
      const jwtToken = jwtData.token;

      const response = await fetch(`${environment.restServis}osoba/${this.idOsobe}/film?stranica=${this.trenutnaStranicaFilmova}`, {
        headers: {
          Authorization: jwtToken,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Greška prilikom dohvaćanja filmova iz baze.');
      const filmovi = await response.json();
      this.filmovi = [...this.filmovi, ...filmovi];

      if (filmovi.length < 20) {
        this.bazaFilmoviGotova = true;
      }
    } catch (error) {
      console.error('Greška prilikom učitavanja filmova iz baze:', error);
    }
  }

  async ucitajFilmoveSaTMDB(): Promise<void> {
    try {
      const jwtResponse = await fetch(`${environment.restServis}app/getJWT`);
      const jwtData = await jwtResponse.json();
      const jwtToken = jwtData.token;

      const response = await fetch(`${environment.restServis}app/${this.idOsobe}/filmoviTmdb?stranica=${this.dodatnaStranicaFilmova}`, {
        headers: {
          Authorization: jwtToken,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Greška prilikom dohvaćanja dodatnih filmova.');
      const filmovi = await response.json();
      this.filmovi = [...this.filmovi, ...filmovi.filmovi];
    } catch (error) {
      console.error('Greška prilikom učitavanja dodatnih filmova:', error);
    }
  }

  async ucitajJosFilmova(): Promise<void> {
    if (!this.bazaFilmoviGotova) {
      this.trenutnaStranicaFilmova++;
      await this.ucitajFilmoveIzBaze();
    } else {
      this.dodatnaStranicaFilmova++;
      await this.ucitajFilmoveSaTMDB();
    }
    this.cdr.detectChanges();
  }
}
