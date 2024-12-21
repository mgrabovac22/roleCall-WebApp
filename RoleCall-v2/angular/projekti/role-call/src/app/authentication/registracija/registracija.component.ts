import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './registracija.component.html',
  styleUrls: ['./registracija.component.scss']
})
export class RegistracijaComponent {

  ime: string = '';
  prezime: string = '';
  email: string = '';
  korime: string = '';
  lozinka: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  async onRegister() {
    const userData = {
      ime: this.ime,
      prezime: this.prezime,
      email: this.email,
      korime: this.korime,
      lozinka: this.lozinka,
    };

    try {
      var podaci = await this.authService.register(userData);
      this.router.navigate(['/login']);
    } catch (error) {
      this.errorMessage = podaci.greska;
      
    }
  }
}
