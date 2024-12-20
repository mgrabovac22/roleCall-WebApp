import { Component } from '@angular/core';
import { KorisniciService } from '../services/korisnici.service';

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

  constructor(private korisniciService: KorisniciService) {}

  ngOnInit() {
    this.dohvatiPodatkeKorisnika();
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
      alert('Zahtjev je uspješno poslan.');
      this.zahtjevPoslan = true;
    } catch (err) {
      console.error(err);
    }
  }
}
