const WeatherJS = require("weather-js");

async function weather(event, api) {
  const data = event.body.split(" ");
  if (data.length > 1 && data[1] === "-help") {
    const usage = "Usage: weather [city]\n\n" +
      "Description: Retrieves the weather information for the specified city.\n\n" +
      "Example: weather London\n\n" +
      "Note: The temperature is displayed in Celsius, and the forecast is for the next 5 days.";
    api.sendMessage(usage, event.threadID);
    return;
  }
  if (data.length < 2) {
    const usage = "Please provide a city or location name. Type 'weather -help' for more information.";
    api.sendMessage(usage, event.threadID);
  } else {
    data.shift();
    const location = data.join(" ");
    WeatherJS.find(
      {
        search: location,
        degreeType: "C",
      },
      (err, result) => {
        if (err) {
          api.sendMessage("An error occurred while fetching the weather data.", event.threadID);
          return;
        }
        if (result.length === 0) {
          api.sendMessage(`No results found for "${location}". Please enter a valid city or location name.`, event.threadID);
          return;
        }
        const weatherData = result[0];
        const message = `Weather for ${weatherData.location.name} (${weatherData.location.lat}, ${weatherData.location.long}):\n\n` +
          `Temperature: ${weatherData.current.temperature}°C / ${(weatherData.current.temperature * 9) / 5 + 32}°F\n` +
          `Sky: ${weatherData.current.skytext}\n` +
          `Feels like: ${weatherData.current.feelslike}\n` +
          `Humidity: ${weatherData.current.humidity}\n` +
          `Wind Speed: ${weatherData.current.winddisplay}\n\n` +
          `Forecast\n` +
          `Mon: ${weatherData.forecast[0].skytextday}\n` +
          `Tue: ${weatherData.forecast[1].skytextday}\n` +
          `Wed: ${weatherData.forecast[2].skytextday}\n` +
          `Thu: ${weatherData.forecast[3].skytextday}\n` +
          `Fri: ${weatherData.forecast[4].skytextday}\n`;
        api.sendMessage(message, event.threadID);
      }
    );
  }
}

module.exports = weather;
