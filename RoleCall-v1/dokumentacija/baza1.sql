CREATE TABLE "tip_korisnika"(
  "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "naziv" VARCHAR(45) NOT NULL,
  "opis" TEXT
);
CREATE TABLE "korisnik"(
  "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "ime" VARCHAR(50),
  "prezime" VARCHAR(100),
  "adresa" TEXT,
  "korime" VARCHAR(50) NOT NULL UNIQUE,
  "lozinka" VARCHAR(1000) NOT NULL,
  "email" VARCHAR(100) NOT NULL,
  "tip_korisnika_id" INTEGER NOT NULL,
  "status" VARCHAR(45),
  "telefon" VARCHAR(20),
  "grad" VARCHAR(100),
  "država" VARCHAR(100),
  CONSTRAINT "fk_korisnik_tip_korisnika"
    FOREIGN KEY("tip_korisnika_id")
    REFERENCES "tip_korisnika"("id")
);

INSERT INTO "tip_korisnika"("naziv", "opis")
VALUES ('Registrirani korisnik', 'Korisnik koji ima samo određena prava'),
       ('Administrator', 'Korisnik koji nema ograničenja prava'),
       ('Gost', 'Korisnik koji nema prava.');



INSERT INTO "korisnik" (
  "ime", 
  "prezime", 
  "adresa", 
  "korime", 
  "lozinka", 
  "email", 
  "tip_korisnika_id", 
  "status", 
  "telefon", 
  "grad", 
  "država"
)
VALUES
  ('Marin', 'Grabovac', 'Adresa 3', 'admin', '9bf8be4d1bdf4f31acca2c7fc3172cc57e0a49e25110ef21be0df6fe859ce112', 'test1@primjer.com', 2, 'Ima pristup', '0913334444', 'Vitez', 'Bosna i Hercegovina'),
  ('Marko', 'Perković', 'Adresa 4', 'obican', '906a472189a22ab504c0ab208135954cd5e2873d76ef5b1d3873b60b1ff06cdd', 'admin2@primjer.com', 1, 'Poslan zahtjev', '0915556666', 'Rijeka', 'Hrvatska');


SELECT * FROM tip_korisnika;
