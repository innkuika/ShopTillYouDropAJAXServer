// A static server using Node and Express
const express = require("express");
const fetch = require('node-fetch');

const app = express();

// app.set('trust proxy', true);
getValidSchools();

app.use(function (request, response, next) {
  console.log("got request",request.url);
  next();
})


app.use(function (request, response) {
  response.status(404);
  response.send("Cannot answer this request");
})


// listen for requests :)
const listener = app.listen(3000, () => {
  console.log("The static server is listening on port " + listener.address().port);
});



function getValidSchools() {
  fetch('https://api.data.gov/ed/collegescorecard/v1/schools?api_key=ze2yK4cctL8zzgnOXmBThvaXJda7wYfB44UWd4Vo')
    .then(res => res.json())
    .then(json => console.log(json));
}
