export interface Film {
    row_id?: number; 
    id: number; 
    jezik: string;
    org_naslov: string;
    naslov: string;
    rang_popularnosti: number | null;
    putanja_postera: string | null;
    datum_izdavanja: string;
    opis: string | null;
}

export interface Osoba {
    row_id?: number; 
    id: number; 
    ime_prezime: string;
    izvor_poznatosti: string;
    putanja_profila: string;
    rang_popularnosti: number | null;
}

export interface Slika {
    row_id?: number; 
    id: string; 
    putanja_do_slike: string;
    osoba_id: number;
}

export interface FilmOsoba {
    film_id: number; 
    osoba_id: number; 
    lik: string | null; 
}
