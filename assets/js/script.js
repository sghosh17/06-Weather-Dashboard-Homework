localStorage.clear();

/* This function takes the city name entered in the search box and modifies it and passes it to the Open Weather API to get the
lat long coordinates for the city and then current weather for the coordinates as well as weather forecast for the next 5 days */
function findCityDetails() {
  var inputCity = $("#cityName")[0].value.trim();
  var updatedCity = inputCity.toLowerCase().split(" ");
  var modifiedCity = "";
  for (var i = 0; i < updatedCity.length; i++) {
    updatedCity[i] = updatedCity[i][0].toUpperCase() + updatedCity[i].slice(1);
    modifiedCity += " " + updatedCity[i];
  }
  var cityName = modifiedCity;

  var apiURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    cityName +
    "&units=imperial&appid=d187d828d0c84bf748ecc66e9ced986b";

  fetch(apiURL).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        $("#city-name")[0].textContent =
          cityName + " (" + moment().format("DD/MM/YYYY") + ")";

        $("#city-list").append(
          '<button type="button" class="list-group-item list-group-item-light list-group-item-action city-name">' +
            cityName
        );

        const lat = data.coord.lat;
        const lon = data.coord.lon;

        var latlong = lat.toString() + " " + lon.toString();

        localStorage.setItem(cityName, latlong);

        apiURL =
          "https://api.openweathermap.org/data/2.5/onecall?lat=" +
          lat +
          "&lon=" +
          lon +
          "&exclude=minutely,hourly&units=imperial&appid=d187d828d0c84bf748ecc66e9ced986b";

        fetch(apiURL).then(function (newResponse) {
          if (newResponse.ok) {
            newResponse.json().then(function (newData) {
              getCurrentWeather(newData);
            });
          }
        });
      });
    } else {
      alert("The system cannot find the input city!");
    }
  });
}

/* This function uses the input data and retrieves the current weather data from it and renders it */
function getCurrentWeather(data) {
  $(".results-section").addClass("visible");

  $("#currentIcon")[0].src =
    "http://openweathermap.org/img/wn/" +
    data.current.weather[0].icon +
    "@2x.png";
  $("#temperature")[0].textContent =
    "Temperature: " + data.current.temp.toFixed(1) + " \u2109";
  $("#humidity")[0].textContent = "Humidity: " + data.current.humidity + "% ";
  $("#wind-speed")[0].textContent =
    "Wind Speed: " + data.current.wind_speed.toFixed(1) + " MPH";
  $("#uv-index")[0].textContent = "  " + data.current.uvi;

  if (data.current.uvi < 3) {
    $("#uv-index").removeClass("moderate severe");
    $("#uv-index").addClass("favorable");
  } else if (data.current.uvi < 6) {
    $("#uv-index").removeClass("favorable severe");
    $("#uv-index").addClass("moderate");
  } else {
    $("#uv-index").removeClass("favorable moderate");
    $("#uv-index").addClass("severe");
  }

  getFutureWeather(data);
}

/* This function uses the input data and retrieves the weather forecast data from it for the next 5 days and renders it */
function getFutureWeather(data) {
  for (var i = 0; i < 5; i++) {
    var futureWeather = {
      date: convertUnixTime(data, i),
      icon:
        "http://openweathermap.org/img/wn/" +
        data.daily[i + 1].weather[0].icon +
        "@2x.png",
      temp: data.daily[i + 1].temp.day.toFixed(1),
      wind_speed: data.daily[i + 1].wind_speed.toFixed(1),
      humidity: data.daily[i + 1].humidity,
    };

    var currentSelector = "#day-" + i;
    $(currentSelector)[0].textContent = futureWeather.date;
    currentSelector = "#img-" + i;
    $(currentSelector)[0].src = futureWeather.icon;
    currentSelector = "#temp-" + i;
    $(currentSelector)[0].textContent =
      "Temp: " + futureWeather.temp + " \u2109";
    currentSelector = "#wind-" + i;
    $(currentSelector)[0].textContent =
      "Wind: " + futureWeather.wind_speed + " MPH";
    currentSelector = "#hum-" + i;
    $(currentSelector)[0].textContent =
      "Humidity: " + futureWeather.humidity + "%";
  }
}

function convertUnixTime(data, index) {
  const date = new Date(data.daily[index + 1].dt * 1000);
  return date.toLocaleDateString();
}

$("#search").on("click", function (e) {
  e.preventDefault();
  findCityDetails();
  $("form")[0].reset();
});

$(".city-list-box").on("click", ".city-name", function () {
  var coords = localStorage.getItem($(this)[0].textContent).split(" ");
  coords[0] = parseFloat(coords[0]);
  coords[1] = parseFloat(coords[1]);

  $("#city-name")[0].textContent =
    $(this)[0].textContent + " (" + moment().format("DD/MM/YYYY") + ")";

  apiURL =
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    coords[0] +
    "&lon=" +
    coords[1] +
    "&exclude=minutely,hourly&units=imperial&appid=d187d828d0c84bf748ecc66e9ced986b";

  fetch(apiURL).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        getCurrentWeather(data);
      });
    }
  });
});
