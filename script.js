const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

searchBtn.addEventListener("click", handleSearch);

cityInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        handleSearch();
    }
});

/*
Convert WMO weather code into
description and icon
*/
function getWeatherDescription(code) {

    const weatherCodes = {

        0: ["Clear Sky", "☀"],
        1: ["Partly Cloudy", "⛅"],
        2: ["Partly Cloudy", "⛅"],
        3: ["Partly Cloudy", "⛅"],

        45: ["Foggy", "🌫"],
        48: ["Foggy", "🌫"],

        51: ["Drizzle", "🌦"],
        53: ["Drizzle", "🌦"],
        55: ["Drizzle", "🌦"],

        61: ["Rain", "🌧"],
        63: ["Rain", "🌧"],
        65: ["Rain", "🌧"],

        71: ["Snow", "❄"],
        73: ["Snow", "❄"],
        75: ["Snow", "❄"],

        80: ["Rain Showers", "🌦"],
        81: ["Rain Showers", "🌦"],
        82: ["Rain Showers", "🌦"],

        95: ["Thunderstorm", "⛈"]
    };

    return weatherCodes[code] || ["Unknown", "❓"];
}

/*
Get coordinates from city name
using Open Meteo Geocoding API
*/
async function getCoordinates(city) {

    const url =
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;

    const response = await fetch(url);

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found. Please try again.");
    }

    return data.results[0];
}

/*
Fetch weather data using latitude
and longitude coordinates
*/
async function getWeather(lat, lon) {

    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code,uv_index_max&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to fetch weather data.");
    }

    return await response.json();
}

/*
Display current weather
information in the hero section
*/
function displayCurrentWeather(data, city, country) {

    const current = data.current;

    const weather =
        getWeatherDescription(current.weather_code);

    document.getElementById("cityName").textContent =
        city;

    document.getElementById("countryName").textContent =
        country;

    document.getElementById("temperature").textContent =
        `${current.temperature_2m}°C`;

    document.getElementById("description").textContent =
        weather[0];

    document.getElementById("weatherIcon").textContent =
        weather[1];

    document.getElementById("humidity").textContent =
        `${current.relative_humidity_2m}%`;

    document.getElementById("windSpeed").textContent =
        `${current.wind_speed_10m} km/h`;

    document.getElementById("uvIndex").textContent =
        data.daily.uv_index_max[0];
}

/*
Display 5 day forecast cards
*/
function displayForecast(daily) {

    const container =
        document.getElementById("forecastContainer");

    container.innerHTML = "";

    for (let i = 0; i < 5; i++) {

        const weather =
            getWeatherDescription(daily.weather_code[i]);

        const date =
            new Date(daily.time[i]);

        const day =
            date.toLocaleDateString(
                "en-US",
                { weekday: "short" }
            );

        const card =
            document.createElement("div");

        card.classList.add("forecast-card");

        card.innerHTML = `
            <h4>${day}</h4>
            <div class="forecast-icon">${weather[1]}</div>
            <p>${weather[0]}</p>
            <p>High: ${daily.temperature_2m_max[i]}°C</p>
            <p>Low: ${daily.temperature_2m_min[i]}°C</p>
        `;

        container.appendChild(card);
    }
}

/*
Display error message
*/
function showError(message) {

    document.getElementById("error").textContent =
        message;
}

/*
Main search function
*/
async function handleSearch() {

    const city =
        cityInput.value.trim();

    if (!city) {

        showError("Please enter a city name.");
        return;
    }

    try {

        document.getElementById("loading").textContent =
            "Loading...";

        showError("");

        const location =
            await getCoordinates(city);

        const weather =
            await getWeather(
                location.latitude,
                location.longitude
            );

        displayCurrentWeather(
            weather,
            location.name,
            location.country
        );

        displayForecast(weather.daily);

    }
    catch (error) {

        showError(error.message);
    }
    finally {

        document.getElementById("loading").textContent =
            "";
    }
}