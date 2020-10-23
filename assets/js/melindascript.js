// dailyquakes when the the page loads.
$(document).ready(getdailyQuakes);
// adding eventlistener to functions in order to be able to call the results from kelseyscript.js
document.addEventListener('dailyQuakes', renderPastHourQuakes, false);
document.addEventListener('quakesBySearch', renderQuakesBySearch, false);

// click event registered to take the content of input field and pass it to query with that criteria
$('#search').on('click', function(event) {
    event.preventDefault();
    const location = $('#location').val().trim();
    const startDate = $('#startDate').val().trim();
    const endDate = $('#endDate').val().trim();
    const radius = $('#radius').val().trim();
    placeToCordinates(location, startDate, endDate, radius);
});

// calling the usgs earthquake api to get past hour quakes
function getdailyQuakes() {
    $.ajax({url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson'})
        .then(
            function(response) {
                const lastHourQuakes = collectData(response.features);
                const event = new CustomEvent('dailyQuakes', {detail: lastHourQuakes});
                document.dispatchEvent(event);
            },
            (response, status) => errorHandlingOfLatestQuakes(response, status)
        );
}

// handling past hour quake errors and displying o the screen and console-logging details
function errorHandlingOfLatestQuakes(response, status) {
    console.log(`Request failed. Returned status: ${status}, response: ${JSON.stringify(response)}`);
    $('#errorOfLatestQuakes').html('Sorry, no results for that search.');
}

// extracting the data of quakes for further use
function collectData(features) {
    const quakes = [];

    if (features.length === 0) {
        $('#searchErrors').text('Sorry, no quakes for this search.');
    }

    for (let i = 0; i < features.length; i++) {
        const element = features[i];
        const place = element.properties.place;
        const coords = element.geometry.coordinates;
        const mag = element.properties.mag;
        const time = moment(element.properties.time).format('LLL');
        quakes.push({place: place, coords: coords, mag: mag, time: time});
    }

    return quakes;
}

// rendering quakes by search and appending it to the html tag
function renderQuakesBySearch(event) {
    const quakes = event.detail;
    for (let i = 0; i < quakes.length; i++) {
        $('#searchResults').append(createQuakesInfo(quakes[i], i, 'searchQuakesResult', 'resultelement'));
    }
}

// rendering last five of the past hour quakes and appending it to the html tag
function renderPastHourQuakes(event) {
    const quakes = event.detail.slice(0, 3);
    for (let i = 0; i < quakes.length; i++) {
        $('#latestQs')
            .append(createQuakesInfo(quakes[i], i, 'latestQs', 'latest'));
    }
}

// creating html element and adding appropriate class and attributes
function createQuakesInfo(element, index, id, classe) {
    return $('<p>')
        .attr('id', `${id}-${index}`)
        .addClass(classe)
        .append(createDataPoint('Location', element.place))
        .append(createDataPoint('Magnitude', element.mag.toFixed(2)))
        .append(createDataPoint('Time', element.time));
}

// creating datapoint element and appending details accordingly and appeding it to the html
function createDataPoint(label, value) {
    return $('<span>')
        .addClass('dataPoint')
        .append(createLabel(label))
        .append(': ')
        .append(value)
        .append(' ');
}

// creating class tag of datapoint
function createLabel(labelText) {
    return $('<span>')
        .addClass('dataLabel')
        .text(labelText);
}

// convereting string input of location to coordinates by calling opencagedata geocoding api
function placeToCordinates(place, startDate, endDate, radius) {
    const apiKey = '9bdca107dee44c8d90c4efabb9b500e4';

    $('#searchResults').html('');
    $('#searchErrors').html('');
    $.ajax({url: `https://api.opencagedata.com/geocode/v1/json?q=${place}&key=${apiKey}`})
        .then(
            (response) => handleCoordinates(response, startDate, endDate, radius),
            (response, status) => errorHandlingOfCoordinates(response, status)
        );
}

// passing querydata to methods if the response is not empty
function handleCoordinates(response, startDate, endDate, radius) {
    if (response.results.length === 0) {
        $('#searchErrors').text('Sorry, no location has been found.');
    }

    return dataByLocation(
        response.results[0].geometry.lat,
        response.results[0].geometry.lng,
        radius,
        startDate,
        endDate
    );
}

// handling error of response from opencagedata api call
function errorHandlingOfCoordinates(response, status) {
    console.log(`Request failed. Returned status: ${status}, response: ${JSON.stringify(response)}`);
    $('#searchErrors').text('Unable to search for quakes');
}

// querying for earthquakes based on input parameters calling usgs earthquake api with parameters
// lat, lon, radius(km), start date, end date
function dataByLocation(lat, lon, radius, startDate, endDate) {
    $.ajax({url: `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startDate}&endtime=${endDate}&longitude=${lon}&latitude=${lat}&maxradiuskm=${radius}` })
        .then(
            function(response) {
                const quakesBySearch = collectData(response.features);
                const event = new CustomEvent('quakesBySearch', {detail: quakesBySearch});
                document.dispatchEvent(event);
            },
            (response, status) => errorHandlingOfQuery(response, status)
        );
}

// handling response error when calling usgs api by input query parameters
function errorHandlingOfQuery(response, status) {
    console.log(`Request failed. Returned status: ${status}, response: ${JSON.stringify(response)}`);
    $('#searchResults')
        .prepend($('<div>')
            .text('Sorry, no results for that search. Please click on Start Over and try again.'));
}
