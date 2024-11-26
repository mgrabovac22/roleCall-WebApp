document.getElementById("registracija-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const ime = document.getElementById("ime").value;
  const prezime = document.getElementById("prezime").value;
  const adresa = document.getElementById("adresa").value;
  const grad = document.getElementById("grad").value;
  const drzava = document.getElementById("drzava").value;
  const telefon = document.getElementById("telefon").value;
  const korime = document.getElementById("korime").value;
  const lozinka = document.getElementById("lozinka").value;
  const email = document.getElementById("email").value;
  const navElement = document.getElementById("navigacija");

    nav();

    async function nav() {
        const response = await fetch("/servis/navigacija");
        if (!response.ok) {
            throw new Error("Greška prilikom dohvaćanja navigacije.");
        }

        const data = await response.json();

        let navigationHTML = data.navigacija
            .map((item) => `<a href="${item.link}">${item.naziv}</a>`)
            .join("");

        navElement.innerHTML = navigationHTML;
    }

  const body = JSON.stringify({ 
    ime, 
    prezime, 
    adresa, 
    grad, 
    drzava, 
    telefon, 
    korime, 
    lozinka, 
    email 
  });

  try {
    const odgovor = await fetch("/servis/korisnici", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (odgovor.ok) {
      window.location.href="/";
    } else {
      const greska = await odgovor.json();
      document.getElementById("poruka").textContent = greska.greska || "Greška prilikom registracije!";
      document.getElementById("poruka").style.color = "red";
    }
  } catch (err) {
    console.error("Greška:", err);
    document.getElementById("poruka").textContent = "Došlo je do greške!";
    document.getElementById("poruka").style.color = "red";
  }
});
