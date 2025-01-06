import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FilmoviService } from '../../moduls/services/filmovi.service';
import { environment } from '../../../environments/environment.prod';
import { SnijegService } from '../../moduls/services/snijeg.service';

@Component({
  selector: 'app-detalji-comp',
  templateUrl: './detalji-filma.component.html',
  styleUrls: ['./detalji-filma.component.scss'],
  standalone: false,
})
export class DetaljiFilmaComponent implements OnInit {
  idFilma: number | null = null; 
  film: any = null; 
  environment: any = environment;

  intenzitetSnijega: number = 20;
  snowflakes: { duration: number; left: number }[] = [];

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private filmoviService: FilmoviService,
    private snowflakesService: SnijegService
  ) {}

  ngOnInit(): void {
    this.snowflakesService.intenzitetSnijega$.subscribe((intenzitet) => {
      this.intenzitetSnijega = intenzitet;
      this.generateSnowflakes();
    });
    this.route.paramMap.subscribe(async (params) => {
      this.idFilma = params.has('id') ? Number(params.get('id')) : null;
      if (this.idFilma) {
        await this.ucitajDetaljeFilma();
      }
    });
  }

  private generateSnowflakes(): void {
    this.snowflakes = Array.from({ length: this.intenzitetSnijega }, () => ({
      duration: Math.random() * 5 + 5,
      left: Math.random() * 100,
    }));
  }

  async ucitajDetaljeFilma(): Promise<void> {
    try {
      this.film = await this.filmoviService.dohvatiFilmDetalje(this.idFilma!);
    } catch (error) {
      console.error('Greška prilikom učitavanja detalja filma:', error);
    }
  }
}
