import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { RecaptchaService } from '../../../moduls/services/recaptcha.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  intenzitetSnijega: number = 20;
  snowflakes: { duration: number; left: number }[] = [];

  korime: string = '';
  lozinka: string = '';
  totpCode: string = '';
  errorMessage: string = '';
  totpEnabled: boolean = false;
  showTotpPopup: boolean = false;

  constructor(
    private authService: AuthService,
    private recaptchaService: RecaptchaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.generateSnowflakes();
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
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

  async login() {
    this.errorMessage = '';
    this.showTotpPopup = false; 
  
    try {
      const captchaToken = await this.recaptchaService.executeRecaptcha('login');
      console.log('Pokrećem prijavu');
      const totpStatus = await this.authService.getTotpStatus(this.korime);
      this.totpEnabled = totpStatus.status;
  
      const loginResponse = await this.authService.login(
        { korime: this.korime, lozinka: this.lozinka },
        captchaToken,
        this.totpEnabled 
      );
      console.log('Prijava uspješna', loginResponse);
  
      console.log('TOTP status:', this.totpEnabled);
  
      if (this.totpEnabled) {
        console.log('TOTP aktiviran, prikazujem pop-up');
        this.showTotpPopup = true;
      } else {
        console.log('TOTP nije aktiviran, preusmjeravam na početnu');
        this.router.navigate(['/']); 
      }
    } catch (error: any) {
      console.error('Greška prilikom prijave:', error);
      this.errorMessage =
        error.message || 'Došlo je do greške prilikom prijave. Molimo pokušajte ponovo.';
    }
  }
  
  async verifyTotp() {
    this.errorMessage = '';

    try {
      console.log('Provjera TOTP koda...');
      await this.authService.verifyTotpCode(this.korime, this.totpCode);
      console.log('TOTP kod ispravan, preusmjeravam na početnu');
      this.showTotpPopup = false; 
      this.router.navigate(['/']); 
    } catch (error: any) {
      console.error('Greška pri provjeri TOTP koda:', error);
      this.errorMessage =
        error.message || 'Neispravan TOTP kod. Molimo pokušajte ponovo.';
    }
  }
}
