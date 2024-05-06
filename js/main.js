const myAPI = "e1d378ee7a4cc65d64801b505f9bb03e";
// const openWeather = "https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}"
let lon = "",
  lat = "";

$.ajax({
  url: `http://api.openweathermap.org/geo/1.0/direct?q=santa-clara&limit=5&appid=${myAPI}`,
  method: "GET",
}).then(function (res) {
  console.log(res);

  lat = res[0].lat;
  lon = res[0].lon;
  getWeatherNextFiveDays(lat, lon);
  getWeatherToday(lat, lon);
});

const getWeatherNextFiveDays = function (lat, lon) {
  $.ajax({
    url: `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${myAPI}`,
    method: "GET",
  }).then(function (res) {
    console.log(res);
  });
};

const getWeatherToday = function (lat, lon) {
  $.ajax({
    url: `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${myAPI}`,
    method: "GET",
  }).then(function (res) {
    console.log(res);
  });
};
