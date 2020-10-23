//Gets earthquake info from Melindascript, to be used in Google maps API.
document.addEventListener('dailyQuakes', printDailyQuakes, false);
document.addEventListener('quakesBySearch', printQuakesBySearch, false);

//This sets map formatting and recenters map to new area once searched.
var map;
var infowindow;
function initMap(lat = 39.8283, lon = -99.5795) {
    map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(lat, lon),
        zoom: 4,
        mapId: 'e4562264712bec6'
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
        strokeWeight: 3,
        scale: 1,

    };
};

//The below is to place coordinates for the last 5 quakes and changes marker color to blue.
function printDailyQuakes(event) {
    initMap(event.detail[0].coords[1], event.detail[0].coords[0]);
    for (var i = 0; i < 6; i++) {
        var coords = event.detail[i].coords;
        var text = 'Most Recent Rumbles - Location: ' + event.detail[i].place + ' Magnitude: ' + event.detail[i].mag + '' + ' Date: ' + event.detail[i].time + ' ';
        var latLng = new google.maps.LatLng(coords[1], coords[0]);
        var tooltip = text;
        var marker = new google.maps.Marker({
            position: latLng,
            map: map,
            zoom: 5,
            icon: pinSymbol('#7DF9FF'),
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

//This is to get data for earthquakes that the user searches for and changes marker color to silver.
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
            icon: pinSymbol('rgb(225,173,17)'),
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
