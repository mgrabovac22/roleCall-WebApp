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
import { NeovlastenPristupComponent } from './neovlasten-pristup/neovlasten-pristup.component';
import { StranicaNijePronadjenaComponent } from './stranica-nije-pronadjena/stranica-nije-pronadjena.component';

const routes: Routes = [
  { path: '', component: PocetnaComponent, canActivate: [AuthGuard], data: { roles: [1, 2, 3] } },
  { path: 'osobe', component: OsobeComponent, canActivate: [AuthGuard], data: { roles: [1, 2] } },
  { path: 'dodavanje', component: DodavanjeComponent, canActivate: [AuthGuard], data: { roles: [2] } },
  { path: 'detalji/:id', component: DetaljiComponent, canActivate: [AuthGuard], data: { roles: [1, 2] } },
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
    StranicaNijePronadjenaComponent
  ],
  imports: [
    BrowserModule, RouterModule.forRoot(routes), FormsModule
  ],
  providers: [AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
