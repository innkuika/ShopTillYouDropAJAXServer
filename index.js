// A static server using Node and Express
const express = require("express");
const fetch = require('node-fetch');

const app = express();

// app.set('trust proxy', true);
let options = [];
(async () => {
    options = await getValidSchools()
    // listen for requests :)
    const listener = app.listen(4000, () => {
        console.log("Ready to serve! The server is listening on port " + listener.address().port);
    });
})()

app.use(function (request, response, next) {
    console.log("got request", request.url);
    next();
})

app.get("/query/getOptions", function (request, response, next) {
    console.log("sending options");
    response.json(options);
});

app.get("/query/getPrice", async function (request, response, next) {
    console.log("sending price details");
    const {id} = request.query
    console.log("id ", id)
    let prices = await getPrices(id)
    response.json(prices);
});


app.use(function (request, response) {
    response.status(404);
    response.send("Cannot answer this request");
})


function timer(ms) {
    return new Promise(res => setTimeout(res, ms));
}

async function getPrices(id) {
    // const CSAPIKEY = process.env['CSAPIKEY']
    const CSAPIKEY = 'G0Jgcw4uUqyURIXnCHCwQnKeO1Tv5pcLYLUb1Whx';
    // const CSAPIKEY = 'ze2yK4cctL8zzgnOXmBThvaXJda7wYfB44UWd4Vo';

    while (true) {
        let res = await fetch(`https://api.data.gov/ed/collegescorecard/v1/schools.json?api_key=${CSAPIKEY}&id=${id}&fields=school.name,2018.cost.net_price.consumer.by_income_level.0-30000,2018.cost.net_price.consumer.by_income_level.30001-48000,2018.cost.net_price.consumer.by_income_level.48001-75000,2018.cost.net_price.consumer.by_income_level.75000-plus,2018.cost.net_price.consumer.by_income_level.110001-plus,2018.cost.tuition.out_of_state,2018.cost.attendance.academic_year,school.city,school.state&page=0`)
        if (!res.ok) {
            console.log(res);
            await timer(3000);
        } else {
            let json = await res.json();
            let result = json['results'];
            if (result.length === 0) {
                continue
            }
            console.log(result)
            const {
                '2018.cost.net_price.consumer.by_income_level.0-30000': income_30k,
                '2018.cost.net_price.consumer.by_income_level.30001-48000': income_48k,
                '2018.cost.net_price.consumer.by_income_level.48001-75000': income_75k,
                '2018.cost.net_price.consumer.by_income_level.75000-plus': income_110k,
                '2018.cost.net_price.consumer.by_income_level.110001-plus': income_110k_plus,
                '2018.cost.tuition.out_of_state': tuition,
                '2018.cost.attendance.academic_year': total_price,
                'school.name': school_name,
                'school.city': school_city,
                'school.state': school_state,
            } = result[0]

            return {
                income_30k,
                income_48k,
                income_75k,
                income_110k,
                income_110k_plus,
                tuition,
                total_price,
                school_name,
                school_city,
                school_state
            }
        }
    }
}

async function getValidSchools() {
    // const CSAPIKEY = process.env['CSAPIKEY']
    const CSAPIKEY = 'G0Jgcw4uUqyURIXnCHCwQnKeO1Tv5pcLYLUb1Whx';
    // const CSAPIKEY = 'ze2yK4cctL8zzgnOXmBThvaXJda7wYfB44UWd4Vo';

    let page = 0;

    let validSchools = [] // [{name:schoolname, value=id}]
    while (true) {
        let res = await fetch(`https://api.data.gov/ed/collegescorecard/v1/schools.json?api_key=${CSAPIKEY}&school.state=CA&fields=school.name,2018.cost.net_price.consumer.by_income_level.0-30000,2018.cost.net_price.consumer.by_income_level.30001-48000,2018.cost.net_price.consumer.by_income_level.48001-75000,2018.cost.net_price.consumer.by_income_level.75000-plus,2018.cost.net_price.consumer.by_income_level.110001-plus,id,2018.cost.tuition.out_of_state,2018.cost.attendance.academic_year,school.city,school.state&per_page=100&page=${page}`)

        if (!res.ok) {
            console.log(res);
            await timer(3000);
            continue;
        }
        let json = await res.json();

        let result = json['results'];
        if (result.length === 0) {
            break;
        }
        page++;
        for (let i = 0; i < result.length; i++) {
            console.log(result[i]);
            const {
                '2018.cost.net_price.consumer.by_income_level.0-30000': income_30k,
                '2018.cost.net_price.consumer.by_income_level.30001-48000': income_48k,
                '2018.cost.net_price.consumer.by_income_level.48001-75000': income_75k,
                '2018.cost.net_price.consumer.by_income_level.75000-plus': income_110k,
                '2018.cost.net_price.consumer.by_income_level.110001-plus': income_110k_plus,
                '2018.cost.tuition.out_of_state': tuition,
                '2018.cost.attendance.academic_year': total_price,
                'school.name': school_name,
                'school.city': school_city,
                'school.state': school_state,
                id: id
            } = result[i]
            // check if data is valid
            if (income_30k && income_48k && income_75k && income_110k && income_110k_plus && tuition && total_price && school_city && school_state) {
                validSchools.push({
                    name: school_name,
                    value: id
                })
            }
        }
        await timer(3000);
    }

    return validSchools
}
