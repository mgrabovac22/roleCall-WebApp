import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { RecaptchaService } from '../../../moduls/services/recaptcha.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './registracija.component.html',
  styleUrls: ['./registracija.component.scss']
})
export class RegistracijaComponent {

  intenzitetSnijega: number = 20;
  snowflakes: { duration: number; left: number }[] = [];

  ime: string = '';
  prezime: string = '';
  email: string = '';
  korime: string = '';
  lozinka: string = '';
  adresa: string = '';
  grad: string = '';
  drzava: string = '';
  telefon: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private recaptchaService: RecaptchaService, private router: Router) {}

  isValid(): boolean {
    return !!(this.email && this.korime && this.lozinka);
  }

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

  async onRegister() {
    const userData = {
      ime: this.ime,
      prezime: this.prezime,
      email: this.email,
      korime: this.korime,
      lozinka: this.lozinka,
      adresa: this.adresa,
      grad: this.grad,
      drzava: this.drzava,
      telefon: this.telefon,
    };

    try {
      const captchaToken = await this.recaptchaService.executeRecaptcha('register');

      await this.authService.register(userData, captchaToken);
      this.router.navigate(['/login']); 
    } catch (error: any) {
      this.errorMessage = error.message || 'Došlo je do greške!';
    }
  }
}
