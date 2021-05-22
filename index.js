// A static server using Node and Express
const express = require("express");
const fetch = require('node-fetch');

const app = express();

// app.set('trust proxy', true);
getValidSchools();

app.use(function(request, response, next) {
  console.log("got request", request.url);
  next();
})


app.use(function(request, response) {
  response.status(404);
  response.send("Cannot answer this request");
})


// listen for requests :)
const listener = app.listen(3000, () => {
  console.log("The static server is listening on port " + listener.address().port);
});


function getValidSchools() {
  const CSAPIKEY = process.env['CSAPIKEY']
  let page = 0;
  let validSchools = [] // [{name:schoolname, value=id}]
  while (true) {
    fetch(`https://api.data.gov/ed/collegescorecard/v1/schools.json?api_key=${CSAPIKEY}&fields=school.name,2018.cost.net_price.consumer.by_income_level.0-30000,2018.cost.net_price.consumer.by_income_level.30001-48000,2018.cost.net_price.consumer.by_income_level.48001-75000,2018.cost.net_price.consumer.by_income_level.75001-110000,2018.cost.net_price.consumer.by_income_level.110001-plus,id&per_page=100&page=${page}`)
      .then(res => res.json())
      .then(json => {
        let result = json.results;
        console.log(result[0])
        for (let i = 0; i < result.length(); i++){
          
        }
      });
  }

}
