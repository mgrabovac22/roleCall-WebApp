import { Component, OnInit } from '@angular/core';
import { FilmoviService } from '../../moduls/services/filmovi.service';
import { environment } from '../../../environments/environment.prod';
import { SnijegService } from '../../moduls/services/snijeg.service';

@Component({
  selector: 'app-filmovi',
  standalone: false,
  templateUrl: './filmovi.component.html',
  styleUrls: ['./filmovi.component.scss']
})
export class FilmoviComponent implements OnInit {
  filmovi: any[] = [];  
  stranica: number = 1; 
  maxStranica: number = 1;  
  datumOdString: string | undefined;
  datumDoString: string | undefined;
  environment: any = environment;

  intenzitetSnijega: number = 20;
  snowflakes: { duration: number; left: number }[] = [];

  constructor(private filmoviService: FilmoviService, private snowflakesService: SnijegService) {}

  ngOnInit(): void {
    this.snowflakesService.intenzitetSnijega$.subscribe((intenzitet) => {
      this.intenzitetSnijega = intenzitet;
      this.generateSnowflakes();
    });
    this.loadFilmovi();  
  }

  private generateSnowflakes(): void {
    this.snowflakes = Array.from({ length: this.intenzitetSnijega }, () => ({
      duration: Math.random() * 5 + 5,
      left: Math.random() * 100,
    }));
  }

  async loadFilmovi() {
    try {
      const data = await this.filmoviService.dohvatiFilmove(
        this.stranica,
        this.datumOdString ? new Date(this.datumOdString).getTime() : undefined,
        this.datumDoString ? new Date(this.datumDoString).getTime() : undefined
      );
      
      this.filmovi = data.filmovi;
      this.maxStranica = data.ukupnoStranica;
    } catch (error) {
      console.error('Greška prilikom učitavanja filmova:', error);
    }
  }

  filtriraj() {
    this.stranica = 1;  
    this.loadFilmovi();  
  }

  prvaStranica() {
    this.stranica = 1;
    this.loadFilmovi();
  }

  prethodnaStranica() {
    if (this.stranica > 1) {
      this.stranica--;
      this.loadFilmovi();
    }
  }

  sljedecaStranica() {
    if (this.stranica < this.maxStranica) {
      this.stranica++;
      this.loadFilmovi();
    }
  }

  zadnjaStranica() {
    this.stranica = this.maxStranica;
    this.loadFilmovi();
  }
}
