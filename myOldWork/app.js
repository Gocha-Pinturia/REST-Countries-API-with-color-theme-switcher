const countriesContainer = document.querySelector(".countries-grid")
const searchInput = document.querySelector('#input');
const regionSelect = document.querySelector('#select');
const btnMode = document.querySelector('button');
let allCountries = [];

btnMode.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme')
})

function applyFilters() {
    const searchItem = searchInput.value.toLowerCase();
    const selectedRegion = regionSelect.value.toLowerCase();

    const filtered = allCountries.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchItem);
        const matchesRegion = selectedRegion === "" || item.region.toLowerCase() === selectedRegion;
        return matchesSearch && matchesRegion;
    })
    renderCountries(filtered);
}

searchInput.addEventListener('input', applyFilters);
regionSelect.addEventListener('change', applyFilters);


async function fetchCountries() {
    const response = await fetch(`https://countries.dev/countries`);

    allCountries = await response.json();
    renderCountries(allCountries);
}

const renderCountries = (countries) => {
    const htmlCards = countries.map(country => {
        return `
            <div class="country-card">
                <div class="country-info">
                    <img src="${country.flags.svg}" alt="${country.name}">
                    <h2>${country.name}</h2>
                    <p><strong>Population:</strong> ${country.population}</p>
                    <p><strong>Region:</strong> ${country.region}</p>
                    <p><strong>Capital:</strong> ${country.capital}</p>
                </div>
           </div>
        `;
    }).join('');

    countriesContainer.innerHTML = htmlCards;
};


fetchCountries();