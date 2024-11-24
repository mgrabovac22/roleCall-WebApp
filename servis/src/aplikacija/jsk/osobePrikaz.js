document.addEventListener("DOMContentLoaded", () => {
    const osobeContainer = document.getElementById("osobeContainer");
    const prethodnaBtn = document.getElementById("prethodna");
    const sljedecaBtn = document.getElementById("sljedeca");
    const trenutnaStranicaEl = document.getElementById("trenutnaStranica");
    const brojPoStraniciSelect = document.getElementById("brojPoStranici");

    let stranica = 1; 
    let ukupnoStranica = 1; 
    let ukupniPodaci = []; 
    let brojPoStranici = parseInt(brojPoStraniciSelect.value, 10); 

    brojPoStraniciSelect.addEventListener("change", () => {
        brojPoStranici = parseInt(brojPoStraniciSelect.value, 10); 
        stranica = 1; 
        azurirajPrikaz(); 
        window.location.reload();
    });

    async function ucitajSveOsobe() {
        try {
            let trenutnaStranica = 1; 
            let sviPodaci = []; 
            let ukupnoStranicaSaServisa = 1;

            do {
                const response = await fetch(`/servis/osobe/prikaz?stranica=${trenutnaStranica}`);
                if (!response.ok) throw new Error(`Greška prilikom dohvaćanja stranice ${trenutnaStranica}.`);

                const podaci = await response.json();
                sviPodaci = [...sviPodaci, ...podaci.osobe];
                ukupnoStranicaSaServisa = podaci.ukupnoStranica;
                trenutnaStranica++;
            } while (trenutnaStranica <= ukupnoStranicaSaServisa);

            ukupniPodaci = sviPodaci; 
            ukupnoStranica = Math.ceil(ukupniPodaci.length / brojPoStranici);
            azurirajPrikaz(); 
        } catch (error) {
            console.error("Greška prilikom učitavanja osoba:", error);
            osobeContainer.innerHTML = `<p style="color: red;">Došlo je do greške prilikom učitavanja osoba.</p>`;
        }
    }

    function azurirajPrikaz() {
        const pocetak = (stranica - 1) * brojPoStranici;
        const kraj = stranica * brojPoStranici;
        const osobeZaPrikaz = ukupniPodaci.slice(pocetak, kraj); 

        prikaziOsobe(osobeZaPrikaz);

        prethodnaBtn.disabled = stranica === 1;
        sljedecaBtn.disabled = stranica === ukupnoStranica;

        trenutnaStranicaEl.textContent = `Stranica: ${stranica} / ${ukupnoStranica}`;
    }

    function prikaziOsobe(osobe) {
        osobeContainer.innerHTML = ""; 

        osobe.forEach((osoba) => {
            const osobaDiv = document.createElement("div");
            osobaDiv.className = "osoba";

            osobaDiv.innerHTML = `
                <img src="${osoba.profilSlika || '/images/default-profile.png'}" alt="${osoba.imePrezime}" />
                <h4>${osoba.imePrezime}</h4>
                <p>${osoba.poznatPo || "Nepoznato"}</p>
            `;

            osobaDiv.addEventListener("click", () => {
                window.location.href = `/osoba/detalji/${osoba.id}`;
            });

            osobeContainer.appendChild(osobaDiv);
        });
    }

    prethodnaBtn.addEventListener("click", () => {
        if (stranica > 1) {
            stranica--;
            azurirajPrikaz();
        }
    });

    sljedecaBtn.addEventListener("click", () => {
        if (stranica < ukupnoStranica) {
            stranica++;
            azurirajPrikaz();
        }
    });

    ucitajSveOsobe();
});
