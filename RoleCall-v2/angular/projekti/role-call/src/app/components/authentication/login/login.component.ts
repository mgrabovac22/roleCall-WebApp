import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { RecaptchaService } from '../../../moduls/services/recaptcha.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  intenzitetSnijega: number = 20;
  snowflakes: { duration: number; left: number }[] = [];

  korime: string = '';   
  lozinka: string = '';  
  errorMessage: string = '';  

  constructor(private authService: AuthService, private recaptchaService: RecaptchaService, private router: Router) {}

  ngOnInit(): void {
    this.generateSnowflakes();
    if (this.authService.isLoggedIn()) {
      console.log(this.authService.isLoggedIn());
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

    try {
      const captchaToken = await this.recaptchaService.executeRecaptcha('login');
      
      await this.authService.login({ korime: this.korime, lozinka: this.lozinka }, captchaToken);
      console.log("aaaaaaaaaaaaaaaaaaaaaa");
      
      this.router.navigate(['/']);  
      
    } catch (error: any) {
      this.errorMessage = (error && error.message) || 'Došlo je do greške prilikom prijave. Molimo pokušajte ponovo.';
    }
  }
}
