document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault(); 

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

            if (podaci.poruka === "Prijava uspješna") {
                window.location.href = "/"; 
            } else {
                throw new Error(podaci.poruka || "Greška prilikom prijave.");
            }
        } else {
            const errorData = await odgovor.json();
            document.getElementById("error-message").textContent = errorData.poruka || "Pogrešno korisničko ime ili lozinka.";
        }
    } catch (error) {
        console.error("Greška prilikom prijave:", error);
        document.getElementById("error-message").textContent = "Došlo je do greške prilikom prijave.";
    }
});
