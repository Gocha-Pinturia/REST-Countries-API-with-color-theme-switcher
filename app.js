const mainView = document.getElementById('main-view');
const detailView = document.getElementById('detail-view');
const countriesGrid = document.getElementById('countries-grid');
const searchInput = document.getElementById('search-input');
const themeToggleBtn = document.getElementById('theme-toggle');

const selectWrapper = document.querySelector('.custom-select-wrapper');
const selectTrigger = document.querySelector('.custom-select-trigger');
const selectTriggerText = selectTrigger.querySelector('span');
const options = document.querySelectorAll('.custom-option');

let allCountries = [];
let selectedRegion = "";

async function fetchCountries() {
    try {
        const response = await fetch('https://countries.dev/countries');
        if (!response.ok) throw new Error('Error loading data');

        allCountries = await response.json();
        renderCountries(allCountries);
    } catch (error) {
        console.error(error);
        countriesGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">Failed to load countries.</p>`;
    }
}

function renderCountries(countriesList) {
    countriesGrid.innerHTML = '';

    if (countriesList.length === 0) {
        countriesGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">No matches found</p>`;
        return;
    }

    countriesList.forEach(country => {
        const card = document.createElement('div');
        card.classList.add('country-card');

        const name = country.name?.common || country.name || 'N/A';
        const flag = country.flags?.svg || country.flag || '';
        const population = country.population !== undefined ? country.population.toLocaleString() : 'N/A';
        const region = country.region || 'N/A';
        const capital = Array.isArray(country.capital) ? country.capital[0] : (country.capital || 'N/A');

        card.innerHTML = `
            <img src="${flag}" alt="Flag of ${name}">
            <div class="country-info">
                <h2>${name}</h2>
                <p><strong>Population:</strong> ${population}</p>
                <p><strong>Region:</strong> ${region}</p>
                <p><strong>Capital:</strong> ${capital}</p>
            </div>
        `;

        card.addEventListener('click', () => {
            showCountryDetail(country);
        });

        countriesGrid.appendChild(card);
    });
}
function showCountryDetail(country) {
    mainView.classList.add('hidden');
    detailView.classList.remove('hidden');

    const name = country.name?.common || country.name || 'N/A';
    const flag = country.flags?.svg || country.flag || '';
    const population = country.population !== undefined ? country.population.toLocaleString() : 'N/A';
    const region = country.region || 'N/A';
    const subregion = country.subregion || 'N/A';
    const capital = Array.isArray(country.capital) ? country.capital[0] : (country.capital || 'N/A');

    const rawTld = country.topLevelDomain || country.tld;
    const tld = Array.isArray(rawTld) ? rawTld.join(', ') : (rawTld || 'N/A');

    let nativeName = 'N/A';
    if (country.name?.nativeName) {
        const nativeKey = Object.keys(country.name.nativeName)[0];
        nativeName = country.name.nativeName[nativeKey]?.common || nativeName;
    } else if (country.nativeName) {
        nativeName = country.nativeName;
    }

    let currencies = 'N/A';
    if (country.currencies) {
        if (Array.isArray(country.currencies)) {
            currencies = country.currencies.map(c => c.name || c).join(', ');
        } else if (typeof country.currencies === 'object') {
            currencies = Object.values(country.currencies).map(c => c.name || c).join(', ');
        } else {
            currencies = country.currencies;
        }
    }

    let languages = 'N/A';
    if (country.languages) {
        if (Array.isArray(country.languages)) {
            languages = country.languages.map(l => l.name || l).join(', ');
        } else if (typeof country.languages === 'object') {
            languages = Object.values(country.languages).join(', ');
        } else {
            languages = country.languages;
        }
    }

    let bordersHTML = '<p>None</p>';
    if (country.borders && country.borders.length > 0) {
        bordersHTML = country.borders.map(borderCode => {
            const foundCountry = allCountries.find(c => c.cca3 === borderCode || c.alpha3Code === borderCode);
            const borderName = foundCountry ? (foundCountry.name?.common || foundCountry.name) : borderCode;
            return `<span class="border-tag">${borderName}</span>`;
        }).join('');
    }

    detailView.innerHTML = `
        <button class="back-btn" id="back-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back
        </button>

        <div class="detail-container">
            <div class="detail-flag">
                <img src="${flag}" alt="Flag of ${name}">
            </div>
            <div class="detail-content">
                <h2>${name}</h2>
                <div class="info-columns">
                    <div class="info-col">
                        <p><strong>Native Name:</strong> ${nativeName}</p>
                        <p><strong>Population:</strong> ${population}</p>
                        <p><strong>Region:</strong> ${region}</p>
                        <p><strong>Sub Region:</strong> ${subregion}</p>
                        <p><strong>Capital:</strong> ${capital}</p>
                    </div>
                    <div class="info-col">
                        <p><strong>Top Level Domain:</strong> ${tld}</p>
                        <p><strong>Currencies:</strong> ${currencies}</p>
                        <p><strong>Languages:</strong> ${languages}</p>
                    </div>
                </div>
                <div class="borders-container">
                    <strong>Border Countries:</strong>
                    <div class="border-tags">
                        ${bordersHTML}
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('back-button').addEventListener('click', () => {
        window.speechSynthesis.cancel();
        detailView.classList.add('hidden');
        mainView.classList.remove('hidden');
    });

    window.speechSynthesis.cancel();
    let bordersText = 'This country has no border countries.';
    if (country.borders && country.borders.length > 0) {
        const borderNames = country.borders.map(borderCode => {
            const foundCountry = allCountries.find(c => c.cca3 === borderCode || c.alpha3Code === borderCode);
            return foundCountry ? (foundCountry.name?.common || foundCountry.name) : borderCode;
        });
        bordersText = `Border countries are: ${borderNames.join(', ')}.`;
    }

    const textToSpeak = `
        Country: ${name}. 
        Native Name: ${nativeName}. 
        Population: ${population}. 
        Region: ${region}. 
        Sub Region: ${subregion}. 
        Capital: ${capital}. 
        Top Level Domain: ${tld}. 
        Currencies: ${currencies}. 
        Languages: ${languages}. 
        ${bordersText}
    `;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    let voices = window.speechSynthesis.getVoices();

    function setBestVoice() {
        const bestVoice = voices.find(voice =>
            voice.lang.includes('en-US') &&
            (voice.name.includes('Google') || voice.name.includes('Samantha') || voice.name.includes('Natural'))
        ) || voices.find(voice => voice.lang.startsWith('en'));

        if (bestVoice) {
            utterance.voice = bestVoice;
        }
    }

    if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            setBestVoice();
            window.speechSynthesis.speak(utterance);
        };
    } else {
        setBestVoice();
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    }

}

function applyFilters() {
    const searchItem = searchInput.value.toLowerCase();

    const filtered = allCountries.filter(item => {
        const countryName = (item.name?.common || item.name || '').toLowerCase();
        const matchesSearch = countryName.includes(searchItem);

        const countryRegion = (item.region || '').toLowerCase();
        const matchesRegion = selectedRegion === "" || countryRegion === selectedRegion;

        return matchesSearch && matchesRegion;
    });

    renderCountries(filtered);
}

searchInput.addEventListener('input', applyFilters);

selectTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    selectWrapper.classList.toggle('open');
});

options.forEach(option => {
    option.addEventListener('click', (e) => {
        const value = e.target.getAttribute('data-value');
        const text = e.target.innerText;

        selectTriggerText.innerText = text;
        selectedRegion = value;
        selectWrapper.classList.remove('open');
        applyFilters();
    });
});

document.addEventListener('click', () => {
    selectWrapper.classList.remove('open');
});

themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
});

fetchCountries();