import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment.prod';

@Component({
  selector: 'app-osobe',
  standalone: false,
  
  templateUrl: './osobe.component.html',
  styleUrl: './osobe.component.scss'
})
export class OsobeComponent implements OnInit {
  osobe: any[] = [];
  stranica: number = 1;
  ukupnoStranica: number = 1;
  brojPoStranici: number = 10;

  async ngOnInit(): Promise<void> {
    await this.ucitajOsobe();
  }

  async ucitajOsobe(): Promise<void> {
    try {
      const response = await fetch(`${environment.restServis}osoba?stranica=${this.stranica}`);
      if (!response.ok) throw new Error('Greška prilikom dohvacanja osoba.');
      
      const podaci = await response.json();
      
      this.osobe = podaci.osobe;
      this.ukupnoStranica = Math.ceil(podaci.ukupnoStranica / this.brojPoStranici);
    } catch (error) {
      console.error('Greška:', error);
    }
  }

  async prethodnaStranica(): Promise<void> {
    if (this.stranica > 1) {
      this.stranica--;
      await this.ucitajOsobe();
    }
  }

  async sljedecaStranica(): Promise<void> {
    if (this.stranica < this.ukupnoStranica) {
      this.stranica++;
      await this.ucitajOsobe();
    }
  }
}
