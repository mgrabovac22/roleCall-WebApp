const apiKey = "1280aa15ece9584768dd84dd4aa3d294"; // Zamijenite s vašim TMDB API ključem
const url = `https://api.themoviedb.org/3/search/person?include_adult=false&language=en-US&page=1`;

async function fetchPersons(query) {
  try {
    const response = await fetch(`${url}&query=${encodeURIComponent(query)}&api_key=${apiKey}`);
    if (!response.ok) {
      throw new Error("Greška prilikom dohvaćanja podataka s TMDB API-ja");
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Greška prilikom dohvaćanja podataka:", error);
    return [];
  }
}

function renderTable(persons) {
  const tableBody = document.querySelector("#results tbody");
  tableBody.innerHTML = ""; 

  persons.forEach((person) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = person.name;
    row.appendChild(nameCell);

    const knownForCell = document.createElement("td");
    knownForCell.textContent = person.known_for_department;
    row.appendChild(knownForCell);

    const popularityCell = document.createElement("td");
    popularityCell.textContent = person.popularity.toFixed(2);
    row.appendChild(popularityCell);

    const profileCell = document.createElement("td");
    if (person.profile_path) {
      const img = document.createElement("img");
      img.src = `https://image.tmdb.org/t/p/w200${person.profile_path}`;
      img.alt = `${person.name}`;
      img.style.width = "50px";
      profileCell.appendChild(img);
    } else {
      profileCell.textContent = "N/A";
    }
    row.appendChild(profileCell);

    tableBody.appendChild(row);
  });
}

document.querySelector("#searchForm").addEventListener("submit", async (event) => {
  event.preventDefault(); 
  const query = document.querySelector("#searchInput").value;
  const persons = await fetchPersons(query);
  renderTable(persons);
});
