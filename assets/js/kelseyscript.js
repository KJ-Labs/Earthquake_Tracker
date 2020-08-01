//Gets information from Melindascript, so that it can be passed to the google maps API
document.addEventListener('dailyQuakes', printDailyQuakes, false);
document.addEventListener('quakesBySearch', printQuakesBySearch, false);


// Gets the pin data, so that each function can change it to a different color.
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
    for (var i = 0; i < event.detail.length; i++) {
        console.log(event.detail)
        var coords = event.detail[i].coords;
        var text = 'Most Recent Rumbles - Location: ' + event.detail[i].place + ' Magnitude: ' + event.detail[i].mag + '' + ' Date: ' + event.detail[i].time + ' ';
        var latLng = new google.maps.LatLng(coords[1], coords[0]);
        var marker = new google.maps.Marker({
            position: latLng,
            map: map,
            icon: pinSymbol('#1AC8DB')
        });

        //This adds the marker based on the last five quakes
        marker.addListener('click', (function (marker, text) {
            return function (e) {
                infowindow.setContent(text);
                infowindow.open(map, marker);
            }
        })(marker, text));
    }
}

//This is to get data for earthquakes that the user searches for rather than just the most recent quakes.
function printQuakesBySearch(event) {
    for (var i = 0; i < event.detail.length; i++) {
        console.log(event.detail.length)
        var coords = event.detail[i].coords;
        var text = 'Searched Rumbles - Location: ' + event.detail[i].place + ' Magnitude: ' + event.detail[i].mag + '' + ' Date: ' + event.detail[i].time + ' ';
        var latLng = new google.maps.LatLng(coords[1], coords[0]);
        var marker = new google.maps.Marker({
            position: latLng,
            map: map,
            icon: pinSymbol('#FF424E')
        });
        //This adds the marker based on the user's search parameters
        marker.addListener('click', (function (marker, text) {
            return function (e) {
                infowindow.setContent(text);
                infowindow.open(map, marker);
            }
        })(marker, text));
    }
}

//This sets the formatting for the map for either function, but centers the map on Seattle, where this specific class is located.
var map;
var infowindow;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: new google.maps.LatLng(47.6062, -122.3321),
        mapTypeId: 'terrain'


    });
    infowindow = new google.maps.InfoWindow();
}


