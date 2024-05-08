const myAPI = "e1d378ee7a4cc65d64801b505f9bb03e";
const clock = dayjs();
const DAY_LENGTH = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TEMP_COLOR_LENGTH = [
  "var(--temp-color-freeze)",
  "var(--temp-color-cold)",
  "var(--temp-color-neutral)",
  "var(--temp-color-warm)",
  "var(--temp-color-hot)",
];
let selectedCity = JSON.parse(localStorage.getItem("selectedCity")) ? JSON.parse(localStorage.getItem("selectedCity")) : {};

// get the latitude and longtitude of a city
// set country as US by DEFAULT
// save city name, state, and country
// this only run when new city is added
$.ajax({
    url: `https://api.openweathermap.org/geo/1.0/direct?q=santa-clara,ca,us&limit=50&appid=${myAPI}`,
    method: "GET"
}).then(function (res) {
    console.log(res);
    selectedCity.cityName = res[0].name;
    selectedCity.state = res[0].state;
    selectedCity.lat = res[0].lat;
    selectedCity.lon = res[0].lon;
    console.log(selectedCity);
    getTempToday();
    getTempNextFiveDays();
});

// suppose I already have an object of a city
// now I can pass lat and lon of that city
// store all neccessary data: temp, temp max and min, humidity and status.
// then store this object to local storage for further action.
const getTempToday = function () {
  $.ajax({
    url: `https://api.openweathermap.org/data/2.5/weather?lat=${selectedCity.lat}&lon=${selectedCity.lon}&units=metric&appid=${myAPI}`,
    method: "GET",
  }).then(function (res) {
    selectedCity.currentTemp = Math.ceil(res.main.temp);
    selectedCity.tempMax = Math.ceil(res.main.temp_max);
    selectedCity.tempMin = Math.ceil(res.main.temp_min);
    selectedCity.huminity = res.main.humidity;
    selectedCity.status = res.weather[0].main;
    localStorage.setItem("selectedCity", JSON.stringify(selectedCity));
    console.log(res);
  });
};

// Now I want to retrieve data for the next 5 days in every 3 hours.
// this function only works when user select a particular city, so we dont need to store data to local storage.
// pass data to display temperature for every next 3 hours, display 15 items.
// when getting data for the next 5 days, remember to pass res.list

// $.ajax({
//   url: `https://api.openweathermap.org/data/2.5/forecast?lat=${selectedCity.lat}&lon=${selectedCity.lon}&units=metric&appid=${myAPI}`,
//   medthod: "GET",
// }).then(function (res) {
//   displayTempNextHours(res);
//   displayTempNextDays(res.list);
//   //   console.log(res);
// });
const getTempNextFiveDays = function () {
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/forecast?lat=${selectedCity.lat}&lon=${selectedCity.lon}&units=metric&appid=${myAPI}`,
        medthod: "GET",
      }).then(function (res) {
        displayTempNextHours(res);
        displayTempNextDays(res.list);
        //   console.log(res);
      });
};

const displayCurrentTemp = function () {
  const currentLocation = $("#current-location");
  const cityName = $("<h3>");
  const temp = $("<h2>");
  const tempDescription = $("<div>");
  const tempStatus = $("<p>");
  const tempMinMaxContainer = $("<div>");
  const tempMax = $("<p>");
  const tempMin = $("<p>");

  tempMax.html(`H:${Math.ceil(selectedCity.tempMax)}&deg;`);
  tempMin.html(`L:${Math.ceil(selectedCity.tempMin)}&deg;`);
  tempMinMaxContainer.addClass("d-flex-row w-1 justify-content-between");
  tempMinMaxContainer.append(tempMax);
  tempMinMaxContainer.append(tempMin);
  tempStatus.text(selectedCity.status);
  tempDescription.addClass("d-flex-col align-items-center");
  tempDescription.append(tempStatus);
  tempDescription.append(tempMinMaxContainer);

  temp.html(`${Math.ceil(selectedCity.currentTemp)}&deg;`);
  cityName.text(`${selectedCity.cityName}`);
  currentLocation.append(cityName);
  currentLocation.append(temp);
  currentLocation.append(tempDescription);
};

// display hourly weather
const displayTempNextHours = function (data) {
  const weatherInNextThreeHoursList = $("#temp-in-three-hours");
  for (let i = -1; i < 15; i++) {
    const item = $("<li>");
    const hour = $("<p>");
    const weatherStatus = $("<img>");
    const tempNextThreeHour = $("<p>");
    tempNextThreeHour.addClass("hourly-forecast__temp");

    item.addClass("list-item d-flex-col align-items-center mr-2");
    hour.addClass("hourly-forecast__time");
    weatherStatus.attr("src", "./images/Clouds.png");
    weatherStatus.addClass("icon mt-2 mb-2");

    if (i == -1) {
      hour.text("Now");
      tempNextThreeHour.html(`${Math.ceil(selectedCity.currentTemp)}&deg;`);
    } else {
      const nextHour = convertToAmPm(
        parseInt(data.list[i].dt_txt.split(" ")[1].split(":")[0])
      );
      hour.text(`${nextHour}`);
      tempNextThreeHour.html(`${Math.ceil(data.list[i].main.temp)}&deg;`);
    }

    item.append(hour);
    item.append(weatherStatus);
    item.append(tempNextThreeHour);

    weatherInNextThreeHoursList.append(item);
  }
};

const displayTempNextDays = function (data) {
  //   console.log(data);
  let currentDay = parseInt(clock.date());
  const forecastDaily = $("#forecast-daily");

  let isToday = true;
  // weatherStatus[0] = rain
  // weatherStatus[1] = clear
  // weatherStatus[2] = scattered cloud
  // weatherStatus[3] = cloud
  let weather = {
    min: selectedCity.tempMin,
    max: selectedCity.tempMax,
    weatherStatus: [0, 0, 0, 0],
  };

  for (obj of data) {
    const item = $("<li>");
    const date = $("<p>");
    const tempStatus = $("<img>");
    const tempMinMax = $("<div>");
    const tempMin = $("<p>");
    const tempBar = $("<span>");
    const tempMax = $("<p>");
    let nextDate = dayjs(obj.dt_txt.split(" ")[0], "YYYY-MM-DD");
    nextDay = parseInt(nextDate.date());
    // console.log(`current day: ${currentDay}`);
    // console.log(`next day: ${nextDay}`);
    if (currentDay == nextDay) {
      if (weather.min > obj.main.temp_min)
        weather.min = Math.ceil(obj.main.temp_min);
      if (weather.max < obj.main.temp_max)
        weather.max = Math.ceil(obj.main.temp_max);
      weatherStatus = obj.weather[0].main;
      if (weatherStatus == "Rain") weather.weatherStatus[0]++;
      else if (weatherStatus == "Clear") weather.weatherStatus[1]++;
      else if (obj.weather[0].description == "scattered clouds")
        weather.weatherStatus[2]++;
      else weather.weatherStatus[3]++;
    } else {
      console.log(weather);
      tempMax.html(`${weather.max}&deg;`);
      tempMin.html(`${weather.min}&deg;`);
      tempBar.addClass(`temp-bar`);
      tempBar.css("background", `${findTempBar(weather.min, weather.max)}`);
      tempMinMax.addClass("d-flex-row align-items-center");
      tempMinMax.append(tempMin);
      tempMinMax.append(tempBar);
      tempMinMax.append(tempMax);

      let statusIdx = 0;
      let counter = weather.weatherStatus[0];
      for (let i = 1; i < 4; i++) {
        if (weather.weatherStatus[i] > counter) statusIdx = i;
      }
      tempStatus.addClass("icon");
      if (statusIdx == 0) {
        tempStatus.attr("src", "./images/Rain.png");
      } else if (statusIdx == 1) {
        tempStatus.attr("src", "./images/Sunny.png");
      } else if (statusIdx == 2) {
        tempStatus.attr("src", "./images/cloudy.png");
      } else {
        tempStatus.attr("src", "./images/Clouds.png");
      }

      if (isToday) {
        date.text("Today");
        isToday = false;
      } else {
        if (nextDate.day() == 0) {
          date.text(`${DAY_LENGTH[6]}`);
        } else date.text(`${DAY_LENGTH[nextDate.day() - 1]}`);
      }

      item.addClass(
        "list-item d-flex-row justify-content-between align-items-center"
      );
      item.append(date);
      item.append(tempStatus);
      item.append(tempMinMax);

      forecastDaily.append(item);

      currentDay = nextDay;
      weather = { min: 99, max: -99, weatherStatus: [0, 0, 0, 0] };
    }
  }
};

const convertToAmPm = function (hour) {
  if (hour == 0) return "12AM";
  if (hour == 12) return "12PM";
  if (hour > 12) return `${hour - 12}PM`;
  return `${hour}AM`;
};

// 0: < 8
// 1: 9 - 16
// 2: 17 - 24
// 3: 25 - 32
// 4: > 32
const findTempBar = function (tempMin, tempMax) {
  const tempBase = [8, 16, 24, 32, 40];
  let left = 0,
    right = 0;

  for (let i = 0; i < 4; i++) {
    if (tempMin <= tempBase[i] || tempMin <= tempBase[i] + 2) {
      left = i;
      break;
    }
  }

  for (let i = 4; i > -1; i--) {
    if (tempMax >= tempBase[i] - 2) {
      right = i;
      break;
    }
  }

  let colorBar = `linear-gradient(90deg,`;
  for (let i = 0; i <= right - left; i++) {
    colorBar += `${TEMP_COLOR_LENGTH[left + i]} ${(100 * i) / (right - left)}%`;
    if (i != right - left) {
      colorBar += ", ";
    } else {
      colorBar += ")";
    }
  }
  console.log(colorBar);
  return colorBar;
};

displayCurrentTemp();
