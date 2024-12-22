import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router'

import { AppComponent } from './app.component';
import { DokumentacijaComponent } from './dokumentacija/dokumentacija.component';
import { PocetnaComponent } from './pocetna/pocetna.component';
import { LoginComponent } from './authentication/login/login.component';
import { RegistracijaComponent } from './authentication/registracija/registracija.component';
import { OsobeComponent } from './osobe/osobe.component';
import { DetaljiComponent } from './detalji/detalji.component';
import { KorisniciComponent } from './korisnici/korisnici.component';
import { DodavanjeComponent } from './dodavanje/dodavanje.component';
import { FormsModule } from '@angular/forms';
import { AuthGuard } from './authentication/auth/auth.guard';
import { NavigacijaComponent } from './navigacija/navigacija.component';

const routes: Routes = [
  { path: '', component: PocetnaComponent, canActivate: [AuthGuard] },
  { path: 'osobe', component: OsobeComponent, canActivate: [AuthGuard] },
  { path: 'dodavanje', component: DodavanjeComponent, canActivate: [AuthGuard] },
  { path: 'detalji', component: DetaljiComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent},
  { path: 'registracija', component: RegistracijaComponent },
  { path: 'korisnici', component: KorisniciComponent, canActivate: [AuthGuard] },
  { path: 'dokumentacija', component: DokumentacijaComponent },
  { path: 'detalji/:id', component: DetaljiComponent, canActivate: [AuthGuard] },
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
    KorisniciComponent,
    DodavanjeComponent,
    NavigacijaComponent
  ],
  imports: [
    BrowserModule, RouterModule.forRoot(routes), FormsModule
  ],
  providers: [AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
