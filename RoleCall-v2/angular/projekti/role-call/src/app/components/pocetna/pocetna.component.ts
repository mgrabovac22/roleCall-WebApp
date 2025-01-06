import { Component } from '@angular/core';
import { KorisniciService } from '../../moduls/services/korisnici.service';
import { SnijegService } from '../../moduls/services/snijeg.service';

@Component({
  selector: 'app-pocetna',
  standalone: false,
  templateUrl: './pocetna.component.html',
  styleUrl: './pocetna.component.scss',
})
export class PocetnaComponent {
  imePrezime: string = '';
  korisnickoIme: string = '';
  email: string = '';
  status: string = '';
  zahtjevAdminuVisible: boolean = false;
  zahtjevPoslan: boolean = false;

  intenzitetSnijega: number = 20;
  snowflakes: { duration: number; left: number }[] = [];

  constructor(private korisniciService: KorisniciService, private snowflakesService: SnijegService) {}

  ngOnInit() {
    this.snowflakesService.intenzitetSnijega$.subscribe((intenzitet) => {
      this.intenzitetSnijega = intenzitet;
      this.generateSnowflakes();
    });
    this.dohvatiPodatkeKorisnika();
  }

  private generateSnowflakes(): void {
    this.snowflakes = Array.from({ length: this.intenzitetSnijega }, () => ({
      duration: Math.random() * 5 + 5,
      left: Math.random() * 100,
    }));
  }

  async dohvatiPodatkeKorisnika() {
    try {
      const korisnik = await this.korisniciService.dohvatiPodatkeKorisnika();
      this.imePrezime = `${korisnik.ime} ${korisnik.prezime}`;
      this.korisnickoIme = korisnik.korime;
      this.email = korisnik.email;

      switch (korisnik.status) {
        case 'Poslan zahtjev':
          this.status = 'Status je poslan';
          this.zahtjevAdminuVisible = false;
          break;
        case 'Ima pristup':
          this.status = 'Imate ovlasti';
          this.zahtjevAdminuVisible = false;
          break;
        case 'Zabranjen mu je pristup':
          this.status = 'Admin vam je zabranio pristup, za vraćanje prava kontaktirajte podršku';
          this.zahtjevAdminuVisible = false;
          break;
        default:
          this.status = 'Ne postoji aktivan zahtjev za pristup';
          this.zahtjevAdminuVisible = true;
          break;
      }
    } catch (err) {
      console.error(err);
    }
  }

  async posaljiZahtjevAdminu() {
    try {
      await this.korisniciService.posaljiZahtjevAdminu();
      this.zahtjevPoslan = true;
    } catch (err) {
      console.error(err);
    }
  }
}
