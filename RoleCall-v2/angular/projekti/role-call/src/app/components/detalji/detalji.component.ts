import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OsobeService } from '../../moduls/services/osobe.service';
import { FilmoviService } from '../../moduls/services/filmovi.service';
import { environment } from '../../../environments/environment.prod';
import { SnijegService } from '../../moduls/services/snijeg.service';

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
  odabranaSlika: string | null = null;
  isModalOpen: boolean = false;
  trenutnaSlikaIndex: number = 0;
  filmovi: any[] = [];
  trenutnaStranicaFilmova: number = 1;
  dodatnaStranicaFilmova: number = 2;
  bazaFilmoviGotova: boolean = false;
  environment: any = environment;

  intenzitetSnijega: number = 20;
  snowflakes: { duration: number; left: number }[] = [];

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private osobeService: OsobeService, 
    private filmoviService: FilmoviService,
    private snowflakesService: SnijegService
  ) {}

  ngOnInit(): void {
    this.snowflakesService.intenzitetSnijega$.subscribe((intenzitet) => {
      this.intenzitetSnijega = intenzitet;
      this.generateSnowflakes();
    });
    this.route.paramMap.subscribe(async (params) => {
      this.idOsobe = params.has('id') ? Number(params.get('id')) : null;
      if (this.idOsobe) {
        await this.ucitajDetaljeOsobe();
        await this.ucitajFilmoveIzBaze();
      }
    });
  }

  private generateSnowflakes(): void {
    this.snowflakes = Array.from({ length: this.intenzitetSnijega }, () => ({
      duration: Math.random() * 5 + 5,
      left: Math.random() * 100,
    }));
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

  otvoriModal(slika: string) {
    this.odabranaSlika = slika;
    this.trenutnaSlikaIndex = this.slike.indexOf(slika);
    this.isModalOpen = true;
  }

  zatvoriModal() {
    this.isModalOpen = false;
  }

  promijeniSliku(promena: number) {
    this.trenutnaSlikaIndex += promena;
    
    if (this.trenutnaSlikaIndex < 0) {
        this.trenutnaSlikaIndex = this.slike.length - 1; 
    } else if (this.trenutnaSlikaIndex >= this.slike.length) {
        this.trenutnaSlikaIndex = 0; 
    }

    const putanja = this.slike[this.trenutnaSlikaIndex].putanja_do_slike;
    this.odabranaSlika = putanja.startsWith('http') ? putanja : environment.slikePutanja + putanja;
    
  }
}
