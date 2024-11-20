CREATE TABLE "film"(
  "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "jezik" VARCHAR(45) NOT NULL,
  "org_naslov" VARCHAR(100) NOT NULL,
  "naslov" VARCHAR(100) NOT NULL,
  "rang_popularnosti" DECIMAL,
  "putanja_postera" VARCHAR(500),
  "datum_izdavanja" DATE NOT NULL,
  "opis" VARCHAR(500)
);
CREATE TABLE "osoba"(
  "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "ime_prezime" VARCHAR(200) NOT NULL,
  "izvor_poznatosti" VARCHAR(150) NOT NULL,
  "putanja_profila" VARCHAR(500) NOT NULL,
  "rang_popularnosti" DECIMAL
);
CREATE TABLE "slika"(
  "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "putanja_do_slike" VARCHAR(500) NOT NULL,
  "osoba_id" INTEGER NOT NULL,
  CONSTRAINT "fk_slika_osoba1"
    FOREIGN KEY("osoba_id")
    REFERENCES "osoba"("id")
);
CREATE TABLE "film_osoba"(
  "film_id" INTEGER NOT NULL,
  "osoba_id" INTEGER NOT NULL,
  "lik" VARCHAR(80),
  PRIMARY KEY("film_id","osoba_id"),
  CONSTRAINT "fk_film_osoba_film"
    FOREIGN KEY("film_id")
    REFERENCES "film"("id"),
  CONSTRAINT "fk_film_osoba_osoba1"
    FOREIGN KEY("osoba_id")
    REFERENCES "osoba"("id")
);
CREATE TABLE "korisnici"(
  "id" INTEGER PRIMARY KEY NOT NULL,
  "naziv" VARCHAR(100) NOT NULL,
  CONSTRAINT "id_UNIQUE"
    UNIQUE("id")
);
CREATE TABLE "korisnik"(
  "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "korime" VARCHAR(50) NOT NULL,
  "status" VARCHAR(45) NOT NULL,
  "Korisnici_id" INTEGER NOT NULL,
  CONSTRAINT "fk_Korisnik_Korisnici1"
    FOREIGN KEY("Korisnici_id")
    REFERENCES "korisnici"("id")
);

INSERT INTO "film" (
  "jezik",
  "org_naslov",
  "naslov",
  "rang_popularnosti",
  "putanja_postera",
  "datum_izdavanja",
  "opis"
) 
VALUES (
  'sr',
  'Originalni Naslov',
  'Prevedeni Naslov',
  8.5,
  '/putanja/do/postera.jpg',
  '2024-11-19',
  'Ovo je opis filma.'
);

INSERT INTO "korisnici"("naziv")
VALUES ('Registrirani korisnik'),
       ('Administrator');

SELECT * FROM film;
