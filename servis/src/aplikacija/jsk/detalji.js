document.addEventListener("DOMContentLoaded", async () => {
    const pathParts = window.location.pathname.split("/");
    const osobaId = pathParts[pathParts.length - 1]; 
    const detaljiContainer = document.querySelector("#detaljiOsobe");
    const galerijaContainer = document.querySelector("#galerija");
    const filmoviContainer = document.querySelector("#filmovi");
    const ucitajJosBtn = document.querySelector("#ucitajJos");

    let trenutnaStranicaFilmova = 1;

    try {
        const osobaResponse = await fetch(`/servis/osoba/${osobaId}`);
        if (!osobaResponse.ok) throw new Error("Greška prilikom dohvaćanja detalja osobe.");
        const osoba = await osobaResponse.json();

        detaljiContainer.innerHTML = `
            <img src="${osoba.profil_path || '/images/default-profile.png'}" alt="${osoba.name}">
            <h1>${osoba.name}</h1>
            <p>Poznat po: ${osoba.known_for_department || "Nepoznato"}</p>
            <p>Popularnost: ${osoba.popularity || "Nepoznato"}</p>
        `;

        osoba.slike.forEach(slika => {
            const img = document.createElement("img");
            img.src = `https://image.tmdb.org/t/p/w200${slika.file_path}`;
            galerijaContainer.appendChild(img);
        });

        async function ucitajFilmove() {
            const filmoviResponse = await fetch(`/servis/osoba/${osobaId}/film?stranica=${trenutnaStranicaFilmova}`);
            if (!filmoviResponse.ok) throw new Error("Greška prilikom dohvaćanja filmova.");
            const { filmovi, trenutnaStranica, ukupno } = await filmoviResponse.json();

            filmovi.forEach(film => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${film.original_language}</td>
                    <td><span title="${film.overview}">${film.original_title}</span></td>
                    <td>${film.title}</td>
                    <td>${film.popularity.toFixed(2)}</td>
                    <td><img src="https://image.tmdb.org/t/p/w92${film.poster_path}" alt="${film.title}"></td>
                    <td>${film.release_date || "Nepoznato"}</td>
                    <td>${film.character || "Nepoznato"}</td>
                `;
                filmoviContainer.appendChild(row);
            });

            if (trenutnaStranica * 20 >= ukupno) {
                ucitajJosBtn.disabled = true;
            }
        }

        await ucitajFilmove();

        ucitajJosBtn.addEventListener("click", async () => {
            trenutnaStranicaFilmova++;
            await ucitajFilmove();
        });

    } catch (error) {
        console.error("Greška:", error);
        detaljiContainer.innerHTML = `<p>Došlo je do greške prilikom dohvaćanja podataka.</p>`;
    }
});
