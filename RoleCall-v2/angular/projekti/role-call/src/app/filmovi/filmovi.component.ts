import { Component, OnInit } from '@angular/core';
import { FilmoviService } from '../services/filmovi.service';
import { environment } from '../../environments/environment.prod';

@Component({
  selector: 'app-filmovi',
  standalone: false,
  templateUrl: './filmovi.component.html',
  styleUrls: ['./filmovi.component.scss']
})
export class FilmoviComponent implements OnInit {
  filmovi: any[] = [];
  stranica: number = 1;
  datumOdString?: string; 
  datumDoString?: string; 
  environment: any = environment;

  constructor(private filmoviService: FilmoviService) {}

  ngOnInit(): void {
    this.ucitajFilmove();
  }

  async ucitajFilmove(): Promise<void> {
    try {
      const datumOd = this.datumOdString ? new Date(this.datumOdString).getTime() : undefined;
      const datumDo = this.datumDoString ? new Date(this.datumDoString).getTime() : undefined;

      this.filmovi = await this.filmoviService.dohvatiFilmove(this.stranica, datumOd, datumDo);
    } catch (error) {
      console.error('Greška prilikom učitavanja filmova:', error);
    }
  }

  filtriraj(): void {
    this.stranica = 1;
    this.ucitajFilmove();
  }

  sljedecaStranica(): void {
    this.stranica++;
    this.ucitajFilmove();
  }

  prethodnaStranica(): void {
    if (this.stranica > 1) {
      this.stranica--;
      this.ucitajFilmove();
    }
  }
}
