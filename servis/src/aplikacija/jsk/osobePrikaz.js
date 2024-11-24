document.addEventListener("DOMContentLoaded", () => {
    const osobeContainer = document.getElementById("osobeContainer");
    const prethodnaBtn = document.getElementById("prethodna");
    const sljedecaBtn = document.getElementById("sljedeca");
    const trenutnaStranicaEl = document.getElementById("trenutnaStranica");

    let stranica = 1;

    async function ucitajOsobe() {
        try {
            const response = await fetch(`/api/osobe?stranica=${stranica}`);
            if (!response.ok) throw new Error("Greška prilikom dohvaćanja osoba.");
    
            const { osobe, trenutnaStranica, ukupnoStranica } = await response.json();
            prikaziOsobe(osobe);
    
            prethodnaBtn.disabled = trenutnaStranica === 1;
            sljedecaBtn.disabled = trenutnaStranica === ukupnoStranica;
            trenutnaStranicaEl.textContent = `Stranica: ${trenutnaStranica} / ${ukupnoStranica}`;
        } catch (error) {
            console.error("Greška:", error);
        }
    }    

    function prikaziOsobe(osobe) {
        osobeContainer.innerHTML = ""; 

        osobe.forEach((osoba) => {
            const osobaDiv = document.createElement("div");
            osobaDiv.className = "osoba";

            osobaDiv.innerHTML = `
                <img src="${osoba.profilSlika || '/images/default-profile.png'}" alt="${osoba.imePrezime}">
                <h4>${osoba.imePrezime}</h4>
                <p>${osoba.poznatPo}</p>
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
            ucitajOsobe();
        }
    });

    sljedecaBtn.addEventListener("click", () => {
        stranica++;
        ucitajOsobe();
    });

    ucitajOsobe();
});
