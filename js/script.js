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
const WEATHER_STATUS_ICON_LENGTH = [
  "Rain.png",
  "Sunny.png",
  "Moon.png",
  "cloudy.png",
  "Clouds.png",
];
let selectedCity = JSON.parse(localStorage.getItem("selectedCity"))
  ? JSON.parse(localStorage.getItem("selectedCity"))
  : {};
let cityList = JSON.parse(localStorage.getItem("cityList"))
  ? JSON.parse(localStorage.getItem("cityList"))
  : [];

// get the latitude and longtitude of a city
// set country as US by DEFAULT
// save city name, state, and country
// this only run when new city is added
$.ajax({
  url: `https://api.openweathermap.org/geo/1.0/direct?q=santa-clara,ca,us&limit=50&appid=${myAPI}`,
  method: "GET",
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
    selectedCity.weatherStatus = res.weather[0].main;
    localStorage.setItem("selectedCity", JSON.stringify(selectedCity));
    const isCityExisted = cityList.find(function(city) {
        if(city.cityName == selectedCity.cityName && city.state == selectedCity.state){
            return true;
        }
        return false;
    });
    if(!isCityExisted){
        cityList.push(selectedCity);
        localStorage.setItem("cityList", JSON.stringify(cityList));
    }
    
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
  const body = $("body");
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
  tempStatus.text(selectedCity.weatherStatus);
  tempDescription.addClass("d-flex-col align-items-center");
  tempDescription.append(tempStatus);
  tempDescription.append(tempMinMaxContainer);

  temp.html(`${Math.ceil(selectedCity.currentTemp)}&deg;`);
  cityName.text(`${selectedCity.cityName}`);
  currentLocation.append(cityName);
  currentLocation.append(temp);
  currentLocation.append(tempDescription);

  const currentHour = clock.get("hour");
  if (
    selectedCity.weatherStatus == "Rain" ||
    currentHour >= 19 ||
    currentHour <= 5
  ) {
    if (selectedCity.weatherStatus == "Rain")
      body.css("background-image", `url(./images/rain-bg.jpeg)`);
    else body.css("background-image", `url(./images/night-bg.jpeg)`);
    $(".section").addClass("bg-dark-custom");
  } else {
    body.css("background-image", `url(./images/sunny-bg.jpeg)`);
    $(".section").addClass("bg-light-custom");
  }
};

// display hourly weather
const displayTempNextHours = function (data) {
  const weatherInNextThreeHoursList = $("#temp-in-three-hours");
  console.log(data);
  for (let i = -1; i < 15; i++) {
    const item = $("<li>");
    const hour = $("<p>");
    const weatherStatus = $("<img>");
    const tempNextThreeHour = $("<p>");
    tempNextThreeHour.addClass("hourly-forecast__temp");

    item.addClass("list-item d-flex-col align-items-center mr-2");
    hour.addClass("hourly-forecast__time");

    // get status of a weather
    // set up icon
    // weatherStatus.attr("src", "./images/Clouds.png");
    // weatherStatus.addClass("icon mt-2 mb-2");

    if (i == -1) {
      hour.text("Now");
      weatherStatus.attr(
        "src",
        setWeatherStatusIcon(
          parseInt(clock.get("hour")),
          selectedCity.weatherStatus
        )
      );
      weatherStatus.addClass("icon mt-2 mb-2");
      tempNextThreeHour.html(`${Math.ceil(selectedCity.currentTemp)}&deg;`);
    } else {
      let nextHour = parseInt(data.list[i].dt_txt.split(" ")[1].split(":")[0]);
      weatherStatus.attr(
        "src",
        setWeatherStatusIcon(nextHour, data.list[i].weather.main)
      );
      weatherStatus.addClass("icon mt-2 mb-2");
      nextHour = convertToAmPm(nextHour);
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


const displayCityList = function () {
  // const rightNow = dayjs().format('MMM DD, YYYY [at] hh:mm:ss a');
  //   timeDisplayEl.text(rightNow);
  console.log("display city List is running");
//   console.log(cityList);
  const list = $("#city-list");
  const rightNow = dayjs().format("hh:mm");
  for (city of cityList) {
    const item = $("<li>");
    const container = $("<div>");
    const label = $("<label>");
    const input = $("<input>");
    const cardHeader = $("<div>");
    const cardHeaderGroup = $("<div>");
    const cardHeaderCity = $("<h3>");
    const cardHeaderTime = $("<p>");
    const cardHeaderTemp = $("<h2>");
    cardHeaderCity.text(`${city.cityName}`);
    cardHeaderTime.text(rightNow);
    cardHeaderTemp.html(`${city.currentTemp}&deg;`);
    cardHeaderCity.addClass("card__city fw-bold")
    cardHeaderTime.addClass("list-item__city-time fw-bold")
    cardHeaderTemp.addClass("card__current-temp");
    cardHeaderGroup.append(cardHeaderCity);
    cardHeaderGroup.append(cardHeaderTime);
    cardHeader.addClass("d-flex-row justify-content-between align-items-center mb-2");
    cardHeader.append(cardHeaderGroup);
    cardHeader.append(cardHeaderTemp);

    const cardBody = $("<div>");
    const tempStatus = $("<p>");
    const tempMinMax = $("<div>");
    const tempMin = $("<p>");
    const tempMax = $("<p>");
    tempStatus.text(`${city.weatherStatus}`);
    tempMin.html(`L:${city.tempMin}&deg;`);
    tempMax.html(`H:${city.tempMax}&deg;`);
    tempMinMax.addClass("d-flex-row justify-content-between card__weather-min-max");
    tempMinMax.append(tempMax);
    tempMinMax.append(tempMin);
    cardBody.addClass("d-flex-row justify-content-between align-items-end fw-bold");
    cardBody.append(tempStatus);
    cardBody.append(tempMinMax);

    label.attr("for", `${city.cityName}`);
    label.append(cardHeader);
    label.append(cardBody);
    input.addClass("hidden-radio");
    input.attr("type", "radio");
    input.attr("name", `${city.cityName}`);
    input.attr("id", `${city.cityName}`);

    container.addClass("card");
    container.append(label);
    container.append(input);

    item.addClass("list-item");
    item.append(container);

    console.log(tempMin);
    list.append(item);
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

  let tempBar = `linear-gradient(90deg,`;
  if (right - left != 0) {
    for (let i = 0; i <= right - left; i++) {
      tempBar += `${TEMP_COLOR_LENGTH[left + i]} ${
        (100 * i) / (right - left)
      }%`;
      if (i != right - left) {
        tempBar += ", ";
      } else {
        tempBar += ")";
      }
    }
    return tempBar;
  }
  //   console.log(tempBar + `${TEMP_COLOR_LENGTH[left]} 0%, ${TEMP_COLOR_LENGTH[left]} 100%)`);

  return (
    tempBar + `${TEMP_COLOR_LENGTH[left]} 0%, ${TEMP_COLOR_LENGTH[left]} 100%)`
  );
};

// set icon based on weather status and current hour
// if it is rainy -> then icon rain
// if it is clear -> then icon based on hour
//                  if hour from the morning to noon (5AM - 6PM) -> then set sun icon
//                  if hour from the evening to early morning (7Pm - 4AM (next day)) -> then set icon moon.
// if it is cloudy -> then set icon cloudy
// 0: rain
// 1: sunny
// 2: moon
// 3: cloudy (morning)
// 4: cloudy
const setWeatherStatusIcon = function (hour, weatherStatus) {
  // weatherStatus.attr("src", "./images/Clouds.png");
  if (weatherStatus == "Rain")
    return `./images/${WEATHER_STATUS_ICON_LENGTH[0]}`;
  if (weatherStatus == "Clear") {
    if (hour > 4 && hour < 19)
      return `./images/${WEATHER_STATUS_ICON_LENGTH[1]}`;
    return `./images/${WEATHER_STATUS_ICON_LENGTH[2]}`;
  }
  if (hour > 4 && hour < 19) return `./images/${WEATHER_STATUS_ICON_LENGTH[3]}`;
  return `./images/${WEATHER_STATUS_ICON_LENGTH[4]}`;
};

const displayTime = function (){
    const time = dayjs().format("hh:mm:ss");
    // console.log("TIME: ", time);
    $(".list-item__city-time").text(time);
}

displayCurrentTemp();
displayCityList();
setInterval(displayTime, 1000);