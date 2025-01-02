import { Component, OnInit } from '@angular/core';
import { Korak } from '../../moduls/interfaces/KorakI';
import { SnijegService } from '../../moduls/services/snijeg.service';

@Component({
  selector: 'app-dokumentacija',
  standalone: false,
  
  templateUrl: './dokumentacija.component.html',
  styleUrl: './dokumentacija.component.scss'
})
export class DokumentacijaComponent implements OnInit {
  intenzitetSnijega: number = 20;
  snowflakes: { duration: number; left: number }[] = [];

  koraci: Korak[] = [
    { broj: 1, opis: 'Pripremiti osnovni Angular projekt i instalirati sve potrebne module.', tip: 'frontend', status: '✅ Gotovo' },
    { broj: 2, opis: 'Ažurirati tablice iz prve zadaće oko informacija o aplikaciji i servisu.', tip: 'backend', status: '✅ Gotovo' },
    { broj: 3, opis: 'Ažurirati dokumentaciju unutar Angular aplikacije.', tip: 'frontend', status: '✅ Gotovo' },
    { broj: 4, opis: 'Pokrenuti npm skripte za pripremu modula i servis.', tip: 'build', status: '✅ Gotovo' },
    { broj: 5, opis: 'Pozadinski dio servisa sada poslužuje kompajliranu verziju Angular aplikacije.', tip: 'backend', status: '✅ Gotovo' },
    { broj: 6, opis: 'Izbrisati ključeve TMDB servisa za testiranje.', tip: 'backend', status: '✅ Gotovo' },
    { broj: 7, opis: 'Pozadinski dio web aplikacije prebaciti u servis sa PUTANJOM /servis/app/{resurs}.', tip: 'API', status: '✅ Gotovo' },
    { broj: 8, opis: 'Klijentski dio HTML, CSS i JS prebaciti u Angular sa TypeScript-om i SCSS-om.', tip: 'frontend', status: '✅ Gotovo' },
    { broj: 9, opis: 'Klijentski dio aplikacije sada šalje sve podatke preko fetch zahtjeva.', tip: 'frontend', status: '✅ Gotovo' },
    { broj: 10, opis: 'Informacije o adresi i portu čitati iz environment datoteke.', tip: 'config', status: '✅ Gotovo' },
    { broj: 11, opis: 'Doraditi sve komponente aplikacije u skladu sa API-jem.', tip: 'frontend', status: '✅ Gotovo' },
    { broj: 12, opis: 'Kompletirati funkcionalnost dvorazinske autentifikacije.', tip: 'security', status: '✅ Gotovo' },
    { broj: 13, opis: 'Prikazivati QR kod za uključenu dvorazinsku autentifikaciju.', tip: 'security', status: '✅ Gotovo' },
    { broj: 14, opis: 'Prijava omogućava dvorazinsku autentifikaciju za korisnika.', tip: 'frontend', status: '✅ Gotovo' },
    { broj: 15, opis: 'Postojanje inicijalnog korisnika sa svim podacima za prijavu.', tip: 'backend', status: '✅ Gotovo' },
    { broj: 16, opis: 'Dodati funkcionalnost za filtriranje filmova prema datumu.', tip: 'frontend', status: '✅ Gotovo' },
    { broj: 17, opis: 'Omogućiti upload slika za filmove u posebnom direktoriju.', tip: 'backend', status: 'Nije izrađeno' }
  ];

  constructor(private snowflakesService: SnijegService){}

  ngOnInit(): void {
    this.snowflakesService.intenzitetSnijega$.subscribe((intenzitet) => {
      this.intenzitetSnijega = intenzitet;
      this.generateSnowflakes();
    });
  }

  private generateSnowflakes() {
    this.snowflakes = Array.from({ length: this.intenzitetSnijega }, () => ({
      duration: Math.random() * 5 + 5,
      left: Math.random() * 100,
    }));
  }
}
