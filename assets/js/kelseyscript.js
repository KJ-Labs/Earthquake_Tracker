
//Gets information from Melindascript, so that it can be passed to the google maps API
document.addEventListener('dailyQuakes', printDailyQuakes, false);
document.addEventListener('quakesBySearch', printQuakesBySearch, false);

//This sets the formatting for the map for either function,
//but centers the map on the US once it loads.
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
//Variable to put red searched markers into local storage, so it can be cleared when they research.
var gmarkers = [];

// This section is to clear the local storage, so that the user can restart.
document.getElementById("clearButton").addEventListener("click", function () {
    removeMarker();
});

// This section is to clear the last searched city markers, so user only sees the new city.
document.getElementById("search").addEventListener("click", function () {
    removeMarker();
});

//Function is to setup pin colors for each function
function pinSymbol(color) {
    return {
        path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#000',
        strokeWeight: 2,
        scale: 1,
    };
}

//The below is to place coordinates for the quakes that occurred within the last hour
//Map shows data to avoid blank spots, while the user figures out where they want to search.
function printDailyQuakes(event) {
    initMap(event.detail[0].coords[1], event.detail[0].coords[0]);
    for (var i = 0; i < event.detail.length; i++) {
        var coords = event.detail[i].coords;
        var text = 'Most Recent Rumbles - Location: ' + event.detail[i].place + ' Magnitude: ' + event.detail[i].mag + '' + ' Date: ' + event.detail[i].time + ' ';
        var latLng = new google.maps.LatLng(coords[1], coords[0]);
        var marker = new google.maps.Marker({
            position: latLng,
            map: map,
            zoom: 5,
            icon: pinSymbol("#1AC8DB")
        });
        gmarkers.push(marker);
        //This adds the marker based on the last five quakes
        marker.addListener('click', (function (marker, text) {
            return function (e) {
                infowindow.setContent(text);
                infowindow.open(map, marker);
            }
        })(marker, text));
    }
}

//This is to get data for earthquakes that the user searches for rather
//than just the most recent quakes.
function printQuakesBySearch(event) {
    initMap(event.detail[0].coords[1], event.detail[0].coords[0]);
    for (var i = 0; i < event.detail.length; i++) {
        var coords = event.detail[i].coords;
        var text = 'Searched Rumbles - Location: ' + event.detail[i].place + ' Magnitude: ' + event.detail[i].mag + '' + ' Date: ' + event.detail[i].time + ' ';
        var latLng = new google.maps.LatLng(coords[1], coords[0]);
        var marker = new google.maps.Marker({
            position: latLng,
            map: map,
            zoom: 5,
            mapTypeId: 'terrain',
            icon: pinSymbol("#FF424E")
        });
        gmarkers.push(marker);
        //This adds the marker based on the user's search parameters
        marker.addListener('click', (function (marker, text) {
            return function (e) {
                infowindow.setContent(text);
                infowindow.open(map, marker);
            }
        })(marker, text));
    }
}


//This is to remove the markers for the previously searched city and last 5 rumbles.
function removeMarker() {
    if (gmarkers.length > 0) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i] != null) {
                gmarkers[i].setMap(null);
            }
        }
    }
    gmarkers = [];
}
