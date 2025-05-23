document.addEventListener("DOMContentLoaded", ()=>{
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
})

document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    let porukica = document.getElementById("porukaLogin");

    const korime = document.getElementById("korime").value;
    const lozinka = document.getElementById("lozinka").value;

    const body = JSON.stringify({ korime, lozinka });

    try {
        const odgovor = await fetch("/servis/prijava", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body,
        });

        if (odgovor.ok) {
            const podaci = await odgovor.json();
            console.log("Odgovor servera:", podaci);

            const status = podaci.korisnik?.status;
            console.log(status);
            

            if (status === "nema pristup") {
                porukica.innerHTML = "Administrator vam je zabranio pristup!";
            } else {
                window.location.href = "/";
                porukica.innerHTML = ""
            }
        } else {
            const greska = await odgovor.json();
            porukica.innerHTML = greska.poruka || "Pogrešno korisničko ime ili lozinka.";
        }
    } catch (error) {
        console.error("Greška prilikom prijave:", error);
        porukica.innerHTML = "Došlo je do greške prilikom prijave.";
    }
});
