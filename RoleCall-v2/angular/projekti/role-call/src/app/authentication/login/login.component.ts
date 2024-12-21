import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  korime: string = '';   
  lozinka: string = '';  
  errorMessage: string = '';  

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      console.log(this.authService.isLoggedIn());
      
      this.router.navigate(['/']);
    }
  }

  async login() {
    this.errorMessage = '';  

    try {
      await this.authService.login({ korime: this.korime, lozinka: this.lozinka });
      
      this.router.navigate(['/']);  
    } catch (error: any) {
      this.errorMessage = (error && error.message) || 'Došlo je do greške prilikom prijave. Molimo pokušajte ponovo.';
    }
  }
}
