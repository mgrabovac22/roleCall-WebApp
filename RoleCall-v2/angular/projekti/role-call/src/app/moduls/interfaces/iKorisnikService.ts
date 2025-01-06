export interface Tip_korisnika {
    id: number; 
    naziv: string; 
}

export interface Korisnik {
    id: number |  null;
    korime: string; 
    status: string; 
    tip_korisnika: number; 
}
  
  