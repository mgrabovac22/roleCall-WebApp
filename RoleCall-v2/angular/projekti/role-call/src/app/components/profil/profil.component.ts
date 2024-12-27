import { Component, OnInit } from '@angular/core';
import { KorisniciService } from '../../moduls/services/korisnici.service';

@Component({
  selector: 'app-profil',
  standalone: false,
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss'],
})
export class ProfilComponent implements OnInit {
  korisnik: any;
  totpSecret: string | null = null;

  constructor(private korisniciService: KorisniciService) {}

  async ngOnInit() {
    try {
      this.korisnik = await this.korisniciService.dohvatiPodatkeKorisnika();
      this.totpSecret = this.korisnik.totpAktiviran ? this.korisnik.totpSecret : null;
    } catch (error) {
      console.error('Greška prilikom dohvaćanja korisnika:', error);
    }
  }

  async onActivateTOTP() {
    try {
      const response = await this.korisniciService.activateTOTP();
      this.totpSecret = response.tajniKljuc;
      console.log('TOTP tajni ključ:', this.totpSecret);
      this.korisnik.totpAktiviran = true;
    } catch (error) {
      console.error('Greška prilikom aktivacije TOTP:', error);
    }
  }  

  async onDeactivateTOTP() {
    try {
      await this.korisniciService.deactivateTOTP();
      this.korisnik.totpAktiviran = false;
    } catch (error) {
      console.error('Greška prilikom deaktivacije TOTP:', error);
    }
  }
}
