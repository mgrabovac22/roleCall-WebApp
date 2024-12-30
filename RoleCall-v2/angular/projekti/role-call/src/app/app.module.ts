import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router'

import { AppComponent } from './app.component';
import { DokumentacijaComponent } from './components/dokumentacija/dokumentacija.component';
import { PocetnaComponent } from './components/pocetna/pocetna.component';
import { LoginComponent } from './components/authentication/login/login.component';
import { RegistracijaComponent } from './components/authentication/registracija/registracija.component';
import { OsobeComponent } from './components/osobe/osobe.component';
import { DetaljiComponent } from './components/detalji/detalji.component';
import { KorisniciComponent } from './components/korisnici/korisnici.component';
import { DodavanjeComponent } from './components/dodavanje/dodavanje.component';
import { FormsModule } from '@angular/forms';
import { AuthGuard } from './components/authentication/auth/auth.guard';
import { NavigacijaComponent } from './moduls/navigacija/navigacija.component';
import { NeovlastenPristupComponent } from './error-handling/neovlasten-pristup/neovlasten-pristup.component';
import { StranicaNijePronadjenaComponent } from './error-handling/stranica-nije-pronadjena/stranica-nije-pronadjena.component';
import { FilmoviComponent } from './components/filmovi/filmovi.component';
import { ProfilComponent } from './components/profil/profil.component';
import { RecaptchaFormsModule, RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';
import { environment } from '../environments/environment.prod';

const routes: Routes = [
  { path: '', component: PocetnaComponent, canActivate: [AuthGuard], data: { roles: [1, 2, 3] } },
  { path: 'profil', component: ProfilComponent, canActivate: [AuthGuard], data: { roles: [1, 2, 3] } },
  { path: 'osobe', component: OsobeComponent, canActivate: [AuthGuard], data: { roles: [1, 2] } },
  { path: 'filmovi', component: FilmoviComponent, canActivate: [AuthGuard], data: { roles: [1, 2] } },
  { path: 'detalji/:id', component: DetaljiComponent, canActivate: [AuthGuard], data: { roles: [1, 2] } },
  { path: 'dodavanje', component: DodavanjeComponent, canActivate: [AuthGuard], data: { roles: [2] } },
  { path: 'korisnici', component: KorisniciComponent, canActivate: [AuthGuard], data: { roles: [2] } },

  { path: 'nijePronadjeno', component: StranicaNijePronadjenaComponent },
  { path: 'neovlastenPristup', component: NeovlastenPristupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registracija', component: RegistracijaComponent },
  { path: 'dokumentacija', component: DokumentacijaComponent },

  { path: '**', redirectTo: 'nijePronadjeno' }
];

@NgModule({
  declarations: [
    AppComponent,
    DokumentacijaComponent,
    PocetnaComponent,
    LoginComponent,
    RegistracijaComponent,
    OsobeComponent,
    KorisniciComponent,
    DodavanjeComponent,
    NavigacijaComponent,
    NeovlastenPristupComponent,
    StranicaNijePronadjenaComponent,
    FilmoviComponent,
    ProfilComponent
  ],
  imports: [
    BrowserModule, RouterModule.forRoot(routes), FormsModule, RecaptchaFormsModule, RecaptchaV3Module
  ],
  providers: [AuthGuard, { provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.recaptchaSiteKey },],
  bootstrap: [AppComponent]
})
export class AppModule { }
