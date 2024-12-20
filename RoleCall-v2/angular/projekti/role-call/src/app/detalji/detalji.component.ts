import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OsobeService } from '../services/osobe.service';
import { FilmoviService } from '../services/filmovi.service';
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
  environment: any = environment;

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private osobeService: OsobeService, 
    private filmoviService: FilmoviService
  ) {}

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
      this.osoba = await this.osobeService.dohvatiDetaljeOsobe(this.idOsobe!);
      this.slike = this.osoba.slike || [];
    } catch (error) {
      console.error('Greška prilikom učitavanja detalja osobe:', error);
    }
  }

  async ucitajFilmoveIzBaze(): Promise<void> {
    try {
      const filmovi = await this.filmoviService.dohvatiFilmoveIzBaze(this.idOsobe!, this.trenutnaStranicaFilmova);
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
      const filmovi = await this.filmoviService.dohvatiFilmoveSaTMDB(this.idOsobe!, this.dodatnaStranicaFilmova);
      this.filmovi = [...this.filmovi, ...filmovi];
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
