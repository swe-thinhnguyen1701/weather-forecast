const myAPI = "e1d378ee7a4cc65d64801b505f9bb03e";
// const openWeather = "https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}"
let lon = "",
  lat = "";
const body = $("body");
const section = $(".section");
const clock = dayjs();

$.ajax({
  url: `http://api.openweathermap.org/geo/1.0/direct?q=milwaukee,us&limit=50&appid=${myAPI}`,
  method: "GET",
}).then(function (res) {
  const usCountries = [];
  console.log(res);

  lat = res[0].lat;
  lon = res[0].lon;
  for (obj of res) {
    if (obj.country === "US") {
      usCountries.push(obj);
    }
  }
  // console.log(usCountries);
  getWeatherNextFiveDays(lat, lon, res[0]);
  getWeatherToday(lat, lon, res[0]);
});

const getWeatherNextFiveDays = function (lat, lon, city) {
  $.ajax({
    url: `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${myAPI}`,
    method: "GET",
  }).then(function (res) {
    console.log(city);
    getWeatherInNextThreeHours(res, city);
  });
};

const getWeatherToday = function (lat, lon, city) {
  $.ajax({
    url: `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${myAPI}`,
    method: "GET",
  }).then(function (res) {
    console.log(res);
    const cityName = $("#current-location__city");
    const currentTemp = $("#current-location__temp");
    const currentTempMax = $("#current-location__max");
    const currentTempMin = $("#current-location__min");
    cityName.text(`${city.name}`);
    currentTemp.html(`${Math.ceil(res.main.temp)}&deg;`);
    currentTempMax.html(`${Math.ceil(res.main.temp_max)}&deg;`);
    currentTempMin.html(`${Math.ceil(res.main.temp_min)}&deg;`);
    console.log(city);
  });
};

const getWeatherInNextThreeHours = function (data) {
  const weatherInNextThreeHoursList = $("#temp-in-three-hours");
  for (let i = 0; i < 10; i++) {
    const item = $("<li>");
    const hour = $("<p>");
    const status = $("<img>");
    const tempNextThreeHour = $("<p>");
    tempNextThreeHour.addClass("hourly-forecast__temp");

    item.addClass("list-item d-flex-col align-items-center mr-2");
    hour.addClass("hourly-forecast__time");
    status.attr("src", "./images/cloud.png");
    status.addClass("icon mt-2 mb-2");
    if (i == 0) {
      hour.text("Now");
      tempNextThreeHour.html(`${$("#current-location__temp").val()}`);
    }else{
      hour.text("1");
    }

    item.append(hour);
    item.append(status);
    item.append(tempNextThreeHour);

    weatherInNextThreeHoursList.append(item);
  }
};

$(document).ready(function () {
  changeBackground();
});

const changeBackground = function () {
  const currentTime = clock.get("hour");
  // const currentTime = dayjs().set("hour", 17);
  // console.log(currentTime.get("hour"));
  if (currentTime > 6 && currentTime < 18) {
    // console.log("run");
    body.css("background-image", `url("../images/sunny-bg.jpeg")`);
    section.css("background-color", "var(--bg-light)");
  } else {
    body.css("background-image", `url("../images/night-bg-phone.jpeg")`);
    section.css("background-color", "var(--bg-dark)");
  }
};
