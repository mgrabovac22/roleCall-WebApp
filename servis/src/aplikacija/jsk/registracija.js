document.getElementById("registracija-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const ime = document.getElementById("ime").value;
  const prezime = document.getElementById("prezime").value;
  const adresa = document.getElementById("adresa").value;
  const korime = document.getElementById("korime").value;
  const lozinka = document.getElementById("lozinka").value;
  const email = document.getElementById("email").value;

  const body = JSON.stringify({ ime, prezime, adresa, korime, lozinka, email });

  try {
    const odgovor = await fetch("/servis/korisnici", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (odgovor.ok) {
      document.getElementById("poruka").textContent = "Registracija uspješna, pričekajte dok vam Administrator ne odobri pristup, te se onda ulogirajte!";
      
    } else {
      const greska = await odgovor.json();
      document.getElementById("poruka").textContent = greska.greska || "Greška prilikom registracije!";
    }
  } catch (err) {
    console.error("Greška:", err);
    document.getElementById("poruka").textContent = "Došlo je do greške!";
  }
});
