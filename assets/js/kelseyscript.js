//Gets information from Melindascript, so that it can be passed to the google maps API
document.addEventListener('dailyQuakes', printDailyQuakes, false);
document.addEventListener('quakesBySearch', printQuakesBySearch, false);
map.clearOverlays();

//The below is to place coordinates for the quakes that occurred within the last hour
//Map shows data to avoid blank spots, while the user figures out where they want to search.
function printDailyQuakes(event) {
  for (var i = 0; i < event.detail.length; i++) {
    console.log(event.detail)
    var coords = event.detail[i].coords;
    var text = '5 Most Recent Rumble -  Location: ' + event.detail[i].place + ' Magnitude: ' + event.detail[i].mag + '' + ' Date: ' + event.detail[i].time + ' ';
    var latLng = new google.maps.LatLng(coords[1], coords[0]);
    var marker = new google.maps.Marker({
      position: latLng,
      map: map
    });

//This adds the marker based on the last five quakes
    marker.addListener('click', (function(marker, text) {
      return function(e) {
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
    var text = 'Search Rumble -  Location: ' + event.detail[i].place + ' Magnitude: ' + event.detail[i].mag + '' + ' Date: ' + event.detail[i].time + ' ';
    var latLng = new google.maps.LatLng(coords[1], coords[0]);
    var marker = new google.maps.Marker({
      position: latLng,
      map: map
    });
//This adds the marker based on the user's search parameters
    marker.addListener('click', (function(marker, text) {
      return function(e) {
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
    zoom: 3,
    center: new google.maps.LatLng(47.6062, -122.3321),
    mapTypeId: 'terrain'


  });
  infowindow = new google.maps.InfoWindow();
}


