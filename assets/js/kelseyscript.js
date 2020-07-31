// line 4-13: data is accessable for kelseyscript.js:
// 'event.detail' has the object array with the data and has to be passed to the function to be able to acces it.
// to get the coordinates: event.detail[index].coords, printDailyQuakes() and printQuakesBySearch() are only for display
document.addEventListener('dailyQuakes', printDailyQuakes, false);
document.addEventListener('quakesBySearch', printQuakesBySearch, false);

function printDailyQuakes(event) {
    console.log(event.detail);
}

function printQuakesBySearch(event2) {
    console.log(event2.detail.length);
}


var map;
var infowindow;


function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 9,
    center: new google.maps.LatLng(47.6062, -122.3321),
    mapTypeId: 'terrain'
  });
  infowindow = new google.maps.InfoWindow();
}

window.eqfeed_callback = function printDailyQuakes(event) {
  for (var i = 0; i < event.detail.length; i++) {
    console.log(event.detail.length)
    var coords = event.detail[i].coords;
    var text = '' + event.detail[i].place + '';
    var latLng = new google.maps.LatLng(coords[1], coords[0]);
    var marker = new google.maps.Marker({
      position: latLng,
      map: map
    });

    marker.addListener('click', (function(marker, text) {
      return function(e) {
        infowindow.setContent(text);
        infowindow.open(map, marker);
      }
    })(marker, text));
  }
}