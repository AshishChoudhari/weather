var datetime = document.getElementById("datetime");
setInterval(function () {
    var dt = new Date();
    var options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
        timeZoneName: 'short'
    };
    datetime.innerHTML = new Intl.DateTimeFormat('en-US', options).format(dt);
}, 1000);
const apiKey = "4b3a8e81b75b0b2a3b486b6a4ad5013e";
const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");
const locationButton = document.getElementById("location-button");
const cityName = document.getElementById("city-name");
const weatherDesc = document.getElementById("weather-desc");
const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feels-like");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");
const visibility = document.getElementById("visibility");
const sunriseTime = document.getElementById("sunrise-time");
const sunsetTime = document.getElementById("sunset-time");
const pressure = document.getElementById("pressure");
const weatherIcon = document.getElementById("weather-icon");
async function fetchWeatherData(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
}
function storeWeatherData(city, data) {
    localStorage.setItem(`weather_${city.toLowerCase()}`, JSON.stringify(data));
}
function retrieveWeatherData(city) {
    const storedData = localStorage.getItem(`weather_${city.toLowerCase()}`);
    return storedData ? JSON.parse(storedData) : null;
}
function displayWeatherData(data, fromLocalStorage = false) {
    cityName.textContent = data.name;
    weatherDesc.textContent = data.weather[0].description;
    temperature.innerHTML = `${Math.round(data.main.temp - 273.15)} °C`;
    feelsLike.innerHTML = `Feels like ${Math.round(data.main.feels_like - 273.15)} °C`;
    humidity.innerHTML = `Humidity: ${data.main.humidity}%`;
    windSpeed.innerHTML = `Wind speed: ${data.wind.speed} m/s`;
    visibility.innerHTML = `Visibility: ${Math.round(data.visibility / 1000)} km`;
    sunriseTime.innerHTML = `Sunrise: ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}`;
    sunsetTime.innerHTML = `Sunset: ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}`;
    pressure.innerHTML = `Pressure: ${data.main.pressure} hPa`;
    const iconUrl = `http://openweathermap.org/img/w/${data.weather[0].icon}.png`;
    weatherIcon.setAttribute("src", iconUrl);
    if (fromLocalStorage) {
        alert("Weather data fetched from local storage");
    } else {
        alert("Weather data fetched from API");
    }
}
async function handleSearch() {
    const city = searchInput.value;
    if (city) {
        let data = retrieveWeatherData(city);
        if (!data) {
            try {
                if (navigator.onLine) {
                    data = await fetchWeatherData(city);
                    storeWeatherData(city, data);
                    displayWeatherData(data, false);
                } else {
                    alert("You are offline. Cannot fetch new data.");
                    return;
                }
            } catch (error) {
                handleError(error);
                return;
            }
        } else {
            displayWeatherData(data, true);
        }
    } else {
        alert("Please enter a city name");
    }
}
async function handleGetCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
            let data = retrieveWeatherData(`${latitude},${longitude}`);
            if (!data) {
                try {
                    if (navigator.onLine) {
                        const response = await fetch(url);
                        if (!response.ok) {
                            throw new Error("Network response was not ok");
                        }
                        data = await response.json();
                        storeWeatherData(`${latitude},${longitude}`, data);
                        displayWeatherData(data, false);
                    } else {
                        alert("You are offline. Cannot fetch new data.");
                        return;
                    }
                } catch (error) {
                    handleError(error);
                    return;
                }
            } else {
                displayWeatherData(data, true);
            }
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}
function handleError(error) {
    console.error("Error fetching weather data:", error);
    alert("Error fetching weather data");
}
searchButton.addEventListener("click", handleSearch);
searchInput.addEventListener("keyup", event => {
    if (event.key === "Enter") {
        handleSearch();
    }
});
locationButton.addEventListener("click", handleGetCurrentLocation);
const initialData = retrieveWeatherData("Chickasaw");
if (initialData) {
    displayWeatherData(initialData, true);
} else {
    fetchWeatherData("Chickasaw")
        .then(data => {
            displayWeatherData(data, false);
            storeWeatherData("Chickasaw", data);
        })
        .catch(handleError);
}
window.addEventListener("offline", function () {
    alert("You are offline. Some features may not be available.");
});
window.addEventListener("online", function () {
    alert("You are back online.");
});