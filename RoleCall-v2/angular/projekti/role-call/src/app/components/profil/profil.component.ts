import { Component, OnInit } from '@angular/core';
import { KorisniciService } from '../../moduls/services/korisnici.service';
import * as QRCode from 'qrcode';
import { SnijegService } from '../../moduls/services/snijeg.service';

@Component({
  selector: 'app-profil',
  standalone: false,
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss'],
})
export class ProfilComponent implements OnInit {
  intenzitetSnijega: number = 20;
  snowflakes: { duration: number; left: number }[] = [];
  korisnik: any;
  totpSecret: string | null = null;
  totpAktiviran: boolean = false;
  qrCodeImage: string | null = null; 

  constructor(private korisniciService: KorisniciService, private snowflakesService: SnijegService) {}

  async ngOnInit() {
    try {
      this.snowflakesService.intenzitetSnijega$.subscribe((intenzitet) => {
        this.intenzitetSnijega = intenzitet;
        this.generateSnowflakes();
      });
      this.korisnik = await this.korisniciService.dohvatiPodatkeKorisnika();
      this.totpAktiviran = await this.korisniciService.provjeriTOTPStatus();
      this.korisnik.totpAktiviran = this.totpAktiviran;
      if (this.totpAktiviran) {
        this.totpSecret = this.korisnik.totp_secret || null;
        if(this.totpSecret)
          this.generateQRCode(this.totpSecret);  
      }
    } catch (error) {
      console.error('Greška prilikom dohvaćanja korisnika:', error);
    }
  }

  setIntenzitetSnijega(): void {
    this.snowflakesService.setIntenzitetSnijega(this.intenzitetSnijega); 
    this.generateSnowflakes();
  }

  private generateSnowflakes(): void {
    this.snowflakes = Array.from({ length: this.intenzitetSnijega }, () => ({
      duration: Math.random() * 5 + 5,
      left: Math.random() * 100,
    }));
  }

  async onActivateTOTP() {
    try {
      const response = await this.korisniciService.activateTOTP();
      this.totpSecret = response.tajniKljuc;
      this.korisnik.totpAktiviran = true;
      this.totpAktiviran = true;
      this.generateQRCode(this.totpSecret);
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
      this.qrCodeImage = null;  
    } catch (error) {
      console.error('Greška prilikom deaktivacije TOTP:', error);
    }
  }

  private generateQRCode(secret: string) {
    const korime = this.korisnik.korime;
    const issuer = 'RoleCall';  

    const otpUrl = `otpauth://totp/${korime}?issuer=${issuer}&secret=${secret}&digits=6&period=60&algorithm=SHA512`;

    QRCode.toDataURL(otpUrl, (error, url) => {
      if (error) {
        console.error('Greška pri generiranju QR koda:', error);
      } else {
        this.qrCodeImage = url;  
      }
    });
  }
}
