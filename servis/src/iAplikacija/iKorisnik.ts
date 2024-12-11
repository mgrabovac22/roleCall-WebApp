export interface TipKorisnika {
  id: number;
  naziv: string;
  opis: string | null;
}

export interface Korisnik {
  id: number;
  ime: string | null;
  prezime: string | null;
  adresa: string | null;
  korime: string;
  lozinka: string;
  email: string;
  tip_korisnika_id: number;
  status: string;
  telefon: string | null;
  grad: string | null;    
  drzava: string | null;  
}
