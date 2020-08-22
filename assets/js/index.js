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
    const quakes = event.detail.slice(0, 5);
    for (let i = 0; i < quakes.length; i++) {
        $($('#latestQs')
            .append(createQuakesInfo(quakes[i], i, 'latestQs', 'latest')));
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
    $('#searchErrors').text('Unable to search for quakes, please fill out all fields');
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
    $($('#searchResults')
        .prepend($('<div>')
            .text('Please ensure that all fields were filled out and the date range is valid. Please click on Start Over and try again.')));
}


//Gets earthquake info from Melindascript, to be used in Google maps API.
document.addEventListener('dailyQuakes', printDailyQuakes, false);
document.addEventListener('quakesBySearch', printQuakesBySearch, false);

//This sets map formatting and recenters map to new area once searched.
var map;
var infowindow;
function initMap(lat = 39.8283, lon = -99.5795) {
    map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(lat, lon),
        zoom: 5,
        mapTypeId: 'terrain'
    });
    infowindow = new google.maps.InfoWindow();
}
//Used to remove markers/old searches.
var gmarkers = [];
document.getElementById('clearButton').addEventListener('click', function () {
    removeMarker();
    $('#searchResults').html('');
    $('#searchErrors').html('');
    localStorage.clear();
    location.reload();

});

//Sets up marker pin info except for color.
function pinSymbol(color) {
    return {
        path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#000',
        strokeWeight: 2,
        scale: 1,
    };
};

//The below is to place coordinates for the last 5 quakes and changes marker color to blue.
function printDailyQuakes(event) {
    initMap(event.detail[0].coords[1], event.detail[0].coords[0]);
    for (var i = 0; i < 6; i++) {
        var coords = event.detail[i].coords;
        var text = '5 Most Recent Rumbles - Location: ' + event.detail[i].place + ' Magnitude: ' + event.detail[i].mag + '' + ' Date: ' + event.detail[i].time + ' ';
        var latLng = new google.maps.LatLng(coords[1], coords[0]);
        var tooltip = text;
        var marker = new google.maps.Marker({
            position: latLng,
            map: map,
            zoom: 5,
            icon: pinSymbol('#1AC8DB'),
            title: tooltip
        });
        gmarkers.push(marker);
        marker.addListener('click', (function (marker, text) {
            return function (e) {
                infowindow.setContent(text);
                infowindow.open(map, marker);
            }
        })(marker, text));
    }
};

//This is to get data for earthquakes that the user searches for and changes marker color to red.
function printQuakesBySearch(event) {
    initMap(event.detail[0].coords[1], event.detail[0].coords[0]);
    for (var i = 0; i < event.detail.length; i++) {
        var coords = event.detail[i].coords;
        var text = 'Searched Rumbles - Location: ' + event.detail[i].place + ' Magnitude: ' + event.detail[i].mag + '' + ' Date: ' + event.detail[i].time + ' ';
        var tooltip = text;
        var latLng = new google.maps.LatLng(coords[1], coords[0]);
        var marker = new google.maps.Marker({
            position: latLng,
            map: map,
            zoom: 5,
            mapTypeId: 'terrain',
            icon: pinSymbol('#FF424E'),
            title: tooltip
        });
        gmarkers.push(marker);
        marker.addListener('click', (function (marker, text) {
            return function (e) {
                infowindow.setContent(text);
                infowindow.open(map, marker);
            }
        })(marker, text));
    }
};

//This is to remove all markers
function removeMarker() {
    if (gmarkers.length > 0) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i] != null) {
                gmarkers[i].setMap(null);
            }
        }
    }
    gmarkers = [];
};
