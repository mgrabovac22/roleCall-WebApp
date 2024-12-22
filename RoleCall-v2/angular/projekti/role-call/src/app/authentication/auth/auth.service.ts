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

  async logout() {
    console.log("Pokrenuta odjava");
    try {
      const response = await fetch(`${environment.restServis}app/odjava`, {
        method: 'GET',
        credentials: 'include',
      });
  
      if (response.ok) {
        console.log("Odjava uspješna");
        localStorage.removeItem('token'); 
        sessionStorage.removeItem('isFirstTime');
        this.loggedInSubject.next(false);
        return true; 
      } else {
        console.error("Odjava nije uspjela:", response.statusText);
        return false; 
      }
    } catch (error) {
      console.error("Greška pri odjavi:", error);
      throw new Error('Greška pri odjavi');
    }
  }
  
}
