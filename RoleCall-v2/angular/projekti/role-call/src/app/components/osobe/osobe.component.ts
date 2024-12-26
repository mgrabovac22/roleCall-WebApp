import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { OsobeService } from '../../moduls/services/osobe.service';

@Component({
  selector: 'app-osobe',
  standalone: false,
  templateUrl: './osobe.component.html',
  styleUrls: ['./osobe.component.scss']
})
export class OsobeComponent implements OnInit {
  sveOsobe: any[] = [];
  osobe: any[] = [];
  stranica: number = 1;
  ukupnoStranica: number = 1;
  brojPoStranici: number = 10;
  ukupnoStranicaPrikaz: number = 1;
  ukupniPodaci: any[] = [];

  constructor(private router: Router, private osobeService: OsobeService) {}

  @ViewChild('osobeContainer', { static: true }) osobeContainer!: ElementRef;

  async ngOnInit(): Promise<void> {
    await this.ucitajSveOsobe();
  }

  idiNaDetalje(idOsobe: number): void {
    this.router.navigate(['/detalji', idOsobe]); 
  }

  async ucitajSveOsobe(): Promise<void> {
    try {

      let trenutnaStranica = 1;
      let ukupnoStranicaSaServisa = 1;

      do {

        const podaci = await this.osobeService.dohvatiOsobe(trenutnaStranica);

        this.ukupniPodaci = [...this.ukupniPodaci, ...podaci.osobe];
        ukupnoStranicaSaServisa = podaci.ukupnoStranica;

        trenutnaStranica++;
      } while (trenutnaStranica <= ukupnoStranicaSaServisa);

      this.sveOsobe = this.ukupniPodaci;
      this.ukupnoStranica = ukupnoStranicaSaServisa;

      this.ukupnoStranicaPrikaz = Math.ceil(this.ukupniPodaci.length / this.brojPoStranici);

      this.azurirajPrikaz();
    } catch (error) {
      console.error('Greška:', error);
    }
  }

  azurirajPrikaz(): void {
    const pocetak = (this.stranica - 1) * this.brojPoStranici;
    const kraj = this.stranica * this.brojPoStranici;
    this.ukupnoStranicaPrikaz = Math.ceil(this.ukupniPodaci.length / this.brojPoStranici);
    this.osobe = this.sveOsobe.slice(pocetak, kraj);
  }

  async prethodnaStranica(): Promise<void> {
    if (this.stranica > 1) {
      this.stranica--;
      this.azurirajPrikaz();
    }
  }

  async sljedecaStranica(): Promise<void> {
    if (this.stranica < this.ukupnoStranicaPrikaz) {
      this.stranica++;
      this.azurirajPrikaz();
    }
  }

  promjeniBrojPoStranici(event: any) {
    this.brojPoStranici = parseInt(event.target.value, 10);
    this.stranica = 1;
    this.azurirajPrikaz();
  }

  async prvaStranica(): Promise<void> {
    if (this.stranica > 1) {
      this.stranica = 1;
      this.azurirajPrikaz();
    }
  }
  
  async zadnjaStranica(): Promise<void> {
    if (this.stranica < this.ukupnoStranicaPrikaz) {
      this.stranica = this.ukupnoStranicaPrikaz;
      this.azurirajPrikaz();
    }
  }
  
}
