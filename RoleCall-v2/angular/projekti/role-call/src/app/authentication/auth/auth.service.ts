import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() {}

  async register(userData: any) {
    const response = await fetch(`${environment.restServis}app/korisnici`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.greska || 'Greška prilikom registracije.');
    }

    return data;
  }

  async login(credentials: { korime: string, lozinka: string }) {
    const response = await fetch(`${environment.restServis}app/korisnici/prijava`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        credentials: 'include',
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      return data;
    } else {
      throw new Error(data.greska);
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }
}
