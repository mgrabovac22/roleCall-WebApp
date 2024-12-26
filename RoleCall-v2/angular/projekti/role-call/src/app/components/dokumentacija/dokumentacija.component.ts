import { Component, OnInit } from '@angular/core';
import { Korak } from '../../moduls/interfaces/KorakI';

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
    { broj: 2, opis: 'Ažurirati tablice iz prve zadaće oko informacija o aplikaciji i servisu.', tip: 'backend', status: '🔧 U izradi' },
    { broj: 3, opis: 'Ažurirati dokumentaciju unutar Angular aplikacije.', tip: 'frontend', status: '🔧 U izradi' },
    { broj: 4, opis: 'Pokrenuti npm skripte za pripremu modula i servis.', tip: 'build', status: '🔧 U izradi' },
    { broj: 5, opis: 'Pozadinski dio servisa sada poslužuje kompajliranu verziju Angular aplikacije.', tip: 'backend', status: '🔧 U izradi' },
    { broj: 6, opis: 'Izbrisati ključeve TMDB servisa za testiranje.', tip: 'backend', status: '🔧 U izradi' },
    { broj: 7, opis: 'Pozadinski dio web aplikacije prebaciti u servis sa PUTANJOM /servis/app/{resurs}.', tip: 'API', status: '🔧 U izradi' },
    { broj: 8, opis: 'Klijentski dio HTML, CSS i JS prebaciti u Angular sa TypeScript-om i SCSS-om.', tip: 'frontend', status: '🔧 U izradi' },
    { broj: 9, opis: 'Klijentski dio aplikacije sada šalje sve podatke preko fetch zahtjeva.', tip: 'frontend', status: '🔧 U izradi' },
    { broj: 10, opis: 'Informacije o adresi i portu čitati iz environment datoteke.', tip: 'config', status: '🔧 U izradi' },
    { broj: 11, opis: 'Doraditi sve komponente aplikacije u skladu sa API-jem.', tip: 'frontend', status: '🔧 U izradi' },
    { broj: 12, opis: 'Kompletirati funkcionalnost dvorazinske autentifikacije.', tip: 'security', status: '🔧 U izradi' },
    { broj: 13, opis: 'Prikazivati QR kod za uključenu dvorazinsku autentifikaciju.', tip: 'security', status: '🔧 U izradi' },
    { broj: 14, opis: 'Prijava omogućava dvorazinsku autentifikaciju za korisnika.', tip: 'frontend', status: '🔧 U izradi' },
    { broj: 15, opis: 'Postojanje inicijalnog korisnika sa svim podacima za prijavu.', tip: 'backend', status: '🔧 U izradi' },
    { broj: 16, opis: 'Dodati funkcionalnost za filtriranje filmova prema datumu.', tip: 'frontend', status: '🔧 U izradi' },
    { broj: 17, opis: 'Omogućiti upload slika za filmove u posebnom direktoriju.', tip: 'backend', status: '🔧 U izradi' }
  ];

  constructor(){}

  ngOnInit(): void {
    this.generateSnowflakes();
  }

  setIntenzitetSnijega() {
    this.generateSnowflakes();
  }

  private generateSnowflakes() {
    this.snowflakes = Array.from({ length: this.intenzitetSnijega }, () => ({
      duration: Math.random() * 5 + 5,
      left: Math.random() * 100,
    }));
  }
}
