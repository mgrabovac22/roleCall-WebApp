import { Component, OnInit } from '@angular/core';
import { KorisniciService } from '../../moduls/services/korisnici.service';

@Component({
  selector: 'app-profil',
  standalone: false,
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss']
})
export class ProfilComponent implements OnInit {
  korisnik: any;
  totpSecret: string | null = null;

  constructor(private korisniciService: KorisniciService) {}

  async ngOnInit() {
    try {
      this.korisnik = await this.korisniciService.dohvatiPodatkeKorisnika();
    } catch (error) {
      console.error('Greška prilikom dohvaćanja korisnika:', error);
    }
  }

  async onActivateTOTP() {
    try {
      this.totpSecret = await this.korisniciService.activateTOTP();
    } catch (error) {
      console.error('Greška prilikom aktivacije TOTP:', error);
    }
  }

  async onDeactivateTOTP() {
    try {
      await this.korisniciService.deactivateTOTP();
      this.korisnik.totpAktiviran = false;
      this.totpSecret = null;
    } catch (error) {
      console.error('Greška prilikom deaktivacije TOTP:', error);
    }
  }
}
