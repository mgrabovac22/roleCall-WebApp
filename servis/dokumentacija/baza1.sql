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
  "korime" VARCHAR(50) NOT NULL,
  "lozinka" VARCHAR(1000) NOT NULL,
  "email" VARCHAR(100) NOT NULL,
  "tip_korisnika_id" INTEGER NOT NULL,
  "status" VARCHAR(45),
  CONSTRAINT "fk_korisnik_tip_korisnika"
    FOREIGN KEY("tip_korisnika_id")
    REFERENCES "tip_korisnika"("id")
);

INSERT INTO "tip_korisnika"("naziv", "opis")
VALUES ('Registrirani korisnik', 'Korisnik koji ima samo određena prava'),
       ('Administrator', 'Korisnik koji nema ograničenja prava');

INSERT INTO "korisnik" (
  "ime", 
  "prezime", 
  "adresa", 
  "korime", 
  "lozinka", 
  "email", 
  "tip_korisnika_id", 
  "status"
)
VALUES
  ('Običan', 'Korisnik', 'Adresa 1', 'obican', 'rwa', 'obican@primjer.com', 2, 'aktivan'),
  ('Admin', 'Korisnik', 'Adresa 2', 'admin', 'rwa', 'admin@primjer.com', 1, 'aktivan');

SELECT * FROM tip_korisnika;
