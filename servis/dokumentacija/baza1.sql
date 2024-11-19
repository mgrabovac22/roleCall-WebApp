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

INSERT INTO "tip_korisnika" ("naziv", "opis")
VALUES 
  ('administrator', 'Administrator sa svim pravima pristupa.'),
  ('registrirani korisnik', 'Korisnik sa osnovnim pravima pristupa.');

SELECT * FROM tip_korisnika;
