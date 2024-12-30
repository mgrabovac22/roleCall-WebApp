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

  setIntenzitetSnijega(): void {
    this.generateSnowflakes();
  }

  private generateSnowflakes(): void {
    this.snowflakes = Array.from({ length: this.intenzitetSnijega }, () => ({
      duration: Math.random() * 5 + 5,
      left: Math.random() * 100,
    }));
  }

  async login(): Promise<void> {
    this.errorMessage = '';
    this.showTotpPopup = false;

    try {
      const captchaToken = await this.recaptchaService.executeRecaptcha('login');

      const totpStatus = await this.authService.getTotpStatus(this.korime);
      this.totpEnabled = totpStatus.status;

      await this.authService.login(
        { korime: this.korime, lozinka: this.lozinka },
        captchaToken,
        this.totpEnabled
      );

      if (this.totpEnabled) {
        this.showTotpPopup = true;
      } else {
        this.router.navigate(['/']);
      }
    } catch (error: any) {
      this.errorMessage =
        error.message || 'Došlo je do greške prilikom prijave. Molimo pokušajte ponovo.';
    }
  }

  async verifyTotp(): Promise<void> {
    this.errorMessage = '';

    if (!/^\d{6}$/.test(this.totpCode)) {
      this.errorMessage = 'Unesite ispravan 6-znamenkasti TOTP kod.';
      return;
    }

    try {
      await this.authService.verifyTotpCode(this.korime, this.totpCode);
      this.showTotpPopup = false;
      this.router.navigate(['/']);
    } catch (error: any) {
      this.errorMessage =
        error.message || 'Neispravan TOTP kod. Molimo pokušajte ponovo.';
    }
  }
}
