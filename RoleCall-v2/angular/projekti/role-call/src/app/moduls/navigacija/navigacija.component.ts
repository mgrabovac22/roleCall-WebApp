import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../components/authentication/auth/auth.service';  
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigacija',
  templateUrl: './navigacija.component.html',
  standalone: false,
  styleUrls: ['./navigacija.component.scss']
})
export class NavigacijaComponent implements OnInit {
  public uloga: number | null = null;
  public status: string | null = null;
  public isLoggedIn: boolean = false;
  public canAccessPocetna: boolean = false;
  public canAccessOsobe: boolean = false;
  public canAccessDodavanje: boolean = false;
  public canAccessKorisnici: boolean = false;
  public canAccessFilmovi: boolean = false;
  public canAccessProfil: boolean = false;
  public menuItems: any[] = [];

  constructor(private authService: AuthService,  private router: Router) {}

  ngOnInit(): void {
    this.authService.loggedIn$.subscribe((isLoggedIn: boolean) => { 
      this.isLoggedIn = isLoggedIn;
      this.loadUserRole(); 
    });
  
    this.loadUserRole();
  }  

  private async loadUserRole(): Promise<void> {
    try {
      const sessionData = await this.authService.getSesija();
      
      if (sessionData.korime != null) {
        this.isLoggedIn = true;
        this.uloga = sessionData.tip_korisnika;
        this.status = sessionData.status;
        
        if (this.uloga === 2) {
          this.canAccessPocetna = true;
          this.canAccessProfil = true;
          this.canAccessOsobe = true;
          this.canAccessFilmovi = true;
          this.canAccessDodavanje = true;
          this.canAccessKorisnici = true;
        } else if (this.status === 'Ima pristup' && this.uloga === 1) {
          this.canAccessPocetna = true;
          this.canAccessProfil = true;
          this.canAccessOsobe = true;
          this.canAccessFilmovi = true;
          this.canAccessDodavanje = false;
          this.canAccessKorisnici = false;
        } else if ((this.status !== 'Ima pristup' && this.uloga === 1) || (this.status !== 'Ima pristup' && this.uloga === 3)) {
          this.canAccessPocetna = true;
          this.canAccessProfil = true;
          this.canAccessOsobe = false;
          this.canAccessFilmovi = false;
          this.canAccessDodavanje = false;
          this.canAccessKorisnici = false;
        } else {
          this.canAccessProfil = false;
          this.canAccessFilmovi = false;
          this.canAccessPocetna = false;
          this.canAccessOsobe = false;
          this.canAccessDodavanje = false;
          this.canAccessKorisnici = false;
        }
      } else {
        this.isLoggedIn = false;
      }
      this.generateMenu(); 
    } catch (error) {
      console.error('Greška pri učitavanju sesije:', error);
      this.isLoggedIn = false;
    }
  }

  private generateMenu(): void {
    const baseMenu = [
      
    ];

    if (this.isLoggedIn) {
      if (this.canAccessPocetna) {
        baseMenu.push({ label: 'Početna', link: '/' });
      }
      if (this.canAccessOsobe) {
        baseMenu.push({ label: 'Osobe', link: '/osobe' });
      }
      if (this.canAccessFilmovi) {
        baseMenu.push({ label: 'Filmovi', link: '/filmovi' });
      }
      if (this.canAccessDodavanje) {
        baseMenu.push({ label: 'Dodavanje', link: '/dodavanje' });
      }
      if (this.canAccessKorisnici) {
        baseMenu.push({ label: 'Korisnici', link: '/korisnici' });
      }
      baseMenu.push({ label: 'Dokumentacija', link: '/dokumentacija' });
      if (this.canAccessProfil) {
        baseMenu.push({ label: 'Profil', link: '/profil' });
      }
      baseMenu.push({ label: 'Odjava', link: '', action: () => this.logout() });
    } else {
      baseMenu.push({ label: 'Dokumentacija', link: '/dokumentacija' });
      baseMenu.push({ label: 'Login', link: '/login' });
    }

    this.menuItems = baseMenu;
  }

  async logout(): Promise<void> {
    try {
      const success = await this.authService.logout();
      if (success) {
        this.router.navigate(['/login']); 
      }
    } catch (error) {
      console.error('Greška pri odjavi:', error);
    }
  }
}
