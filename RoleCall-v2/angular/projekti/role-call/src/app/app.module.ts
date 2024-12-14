import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router'

import { AppComponent } from './app.component';
import { DokumentacijaComponent } from './dokumentacija/dokumentacija.component';
import { PocetnaComponent } from './pocetna/pocetna.component';
import { LoginComponent } from './login/login.component';
import { RegistracijaComponent } from './registracija/registracija.component';
import { OsobeComponent } from './osobe/osobe.component';
import { DetaljiComponent } from './detalji/detalji.component';
import { KorisniciComponent } from './korisnici/korisnici.component';
import { DodavanjeComponent } from './dodavanje/dodavanje.component';

const routes:Routes = [
  { path: '', component: PocetnaComponent },
  { path: 'osobe', component: OsobeComponent },
  { path: 'dodavanje', component: DodavanjeComponent },
  { path: 'detalji', component: DetaljiComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registracija', component: RegistracijaComponent },
  { path: 'korisnici', component: KorisniciComponent },
  { path: 'dokumentacija', component: DokumentacijaComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  declarations: [
    AppComponent,
    DokumentacijaComponent,
    PocetnaComponent,
    LoginComponent,
    RegistracijaComponent,
    OsobeComponent,
    DetaljiComponent,
    KorisniciComponent,
    DodavanjeComponent
  ],
  imports: [
    BrowserModule, RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
