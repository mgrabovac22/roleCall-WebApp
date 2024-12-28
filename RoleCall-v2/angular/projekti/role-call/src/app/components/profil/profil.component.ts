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
  totpAktiviran: boolean = false;

  constructor(private korisniciService: KorisniciService) {}

  async ngOnInit() {
    try {
      this.korisnik = await this.korisniciService.dohvatiPodatkeKorisnika();
      this.totpAktiviran = await this.korisniciService.provjeriTOTPStatus();
      this.korisnik.totpAktiviran = this.totpAktiviran; 
      if (this.totpAktiviran) {
        this.totpSecret = this.korisnik.totp_secret || null;
      }
    } catch (error) {
      console.error('Greška prilikom dohvaćanja korisnika:', error);
    }
  }
  
  async onActivateTOTP() {
    try {
      const response = await this.korisniciService.activateTOTP();
      this.totpSecret = response.tajniKljuc;
      this.korisnik.totpAktiviran = true;
      this.totpAktiviran = true; 
    } catch (error) {
      console.error('Greška prilikom aktivacije TOTP:', error);
    }
  }
  
  async onDeactivateTOTP() {
    try {
      await this.korisniciService.deactivateTOTP();
      this.korisnik.totpAktiviran = false;
      this.totpAktiviran = false; 
      this.totpSecret = null;
    } catch (error) {
      console.error('Greška prilikom deaktivacije TOTP:', error);
    }
  }
  
}
