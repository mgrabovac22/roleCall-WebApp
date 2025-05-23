document.addEventListener("DOMContentLoaded", async () => {
    const imePrezimeEl = document.getElementById("imePrezime");
    const korisnickoImeEl = document.getElementById("korisnickoIme");
    const emailEl = document.getElementById("email");
    const statusEl = document.getElementById("status");
    const zahtjevAdminuBtn = document.getElementById("zahtjevAdminu");
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

    try {
        const response = await fetch("/servis/korisnici/trenutni", { method: "GET" });
        if (!response.ok) throw new Error("Greška prilikom dohvaćanja podataka korisnika.");

        const korisnik = await response.json();
        imePrezimeEl.textContent = `${korisnik.ime} ${korisnik.prezime}`;
        korisnickoImeEl.textContent = korisnik.korime;
        emailEl.textContent = korisnik.email;
        if(korisnik.status === "Poslan zahtjev"){
            statusEl.textContent = "Status je poslan";
        } else if(korisnik.status === "Ima pristup"){
            statusEl.textContent = "Imate ovlasti";
        } else if(korisnik.status === "Zabranjen mu je pristup"){
            statusEl.textContent = "Admin vam je zabranio pristup, za vraćanje prava kontaktirajte podršku";
        } else if(korisnik.status === "Nije poslan zahtjev"){
            statusEl.textContent = "Ne postoji aktivan zahtjev za pristup";
        }
        

        if (korisnik.status === "Ima pristup" || korisnik.status === "Poslan zahtjev" || korisnik.status === "Zabranjen mu je pristup") {
            zahtjevAdminuBtn.style.display = "none";
        }
        else{
            zahtjevAdminuBtn.style.display = "block";
        }

        zahtjevAdminuBtn.addEventListener("click", async () => {
            try {
                const zahtjevResponse = await fetch("/servis/korisnik/zahtjev", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    }
                });
        
                if (!zahtjevResponse.ok) throw new Error("Greška prilikom slanja zahtjeva.");
        
                alert("Zahtjev je uspješno poslan.");
                zahtjevAdminuBtn.disabled = true;
                zahtjevAdminuBtn.textContent = "Zahtjev poslan";
            } catch (err) {
                console.error(err);
            }
        });        
    } catch (err) {
        console.error(err);
    }
});
