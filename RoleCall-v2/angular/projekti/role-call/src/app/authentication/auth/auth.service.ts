import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false); // Track login state
  public loggedIn$ = this.loggedInSubject.asObservable();

  constructor() {
    this.checkAndClearToken();  
  }

  private checkAndClearToken(): void {
    const isFirstTime = sessionStorage.getItem('isFirstTime');
    
    if (!isFirstTime) {
      this.logout();
      sessionStorage.setItem('isFirstTime', 'true');  
    }
  }

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
      this.loggedInSubject.next(true);
      localStorage.setItem('token', data.token);
      return data;
    } else {
      throw new Error(data.greska);
    }
  }

  async getSesija() {
    const response = await fetch(`${environment.restServis}app/getSesija`, {
      method: 'GET',
      credentials: 'include', 
    });

    if (!response.ok) {
      throw new Error('Neuspelo dobijanje sesije.');
    }

    const sessionData = await response.json();
    return sessionData.session;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout() {
    this.loggedInSubject.next(false);
    sessionStorage.removeItem('isFirstTime');
    localStorage.removeItem('token');
  }
}
