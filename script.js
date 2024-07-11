let map, originMarker, destinationMarker;
let originCoordinates, destinationCoordinates;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8
    });
}

function getOrigin() {
    const originAddress = document.getElementById("origin").value;
    geocodeAddress(originAddress, (coordinates) => {
        originCoordinates = coordinates;
        if (originMarker) originMarker.setMap(null);
        originMarker = new google.maps.Marker({
            map: map,
            position: coordinates
        });
        map.setCenter(coordinates);
        document.getElementById("coordinates").innerText = `Coordinates: ${coordinates.lat}, ${coordinates.lng}`;
        findNearbyPlaces(coordinates);
    });
}

function getDestination() {
    const destinationAddress = document.getElementById("destination").value;
    geocodeAddress(destinationAddress, (coordinates) => {
        destinationCoordinates = coordinates;
        if (destinationMarker) destinationMarker.setMap(null);
        destinationMarker = new google.maps.Marker({
            map: map,
            position: coordinates
        });
        calculateDistanceAndTime();
        getDirections();
    });
}

function geocodeAddress(address, callback) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
        if (status === "OK") {
            const coordinates = results[0].geometry.location;
            callback(coordinates);
        } else {
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
}

function findNearbyPlaces(coordinates) {
    const service = new google.maps.places.PlacesService(map);
    const request = {
        location: coordinates,
        radius: '500',
        type: ['restaurant', 'cafe']
    };
    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            const placesList = document.getElementById("places");
            placesList.innerHTML = "Nearby Restaurants and Cafes:<br>";
            results.forEach(place => {
                placesList.innerHTML += place.name + "<br>";
            });
        } else {
            alert("Places search was not successful for the following reason: " + status);
        }
    });
}

function calculateDistanceAndTime() {
    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
        origins: [originCoordinates],
        destinations: [destinationCoordinates],
        travelMode: 'DRIVING'
    }, (response, status) => {
        if (status === "OK") {
            const element = response.rows[0].elements[0];
            document.getElementById("distance").innerText = `Distance: ${element.distance.text}, Duration: ${element.duration.text}`;
        } else {
            alert("Distance Matrix request was not successful for the following reason: " + status);
        }
    });
}

function getDirections() {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
    directionsService.route({
        origin: originCoordinates,
        destination: destinationCoordinates,
        travelMode: 'DRIVING'
    }, (result, status) => {
        if (status === "OK") {
            directionsRenderer.setDirections(result);
        } else {
            alert("Directions request was not successful for the following reason: " + status);
        }
    });
}

document.addEventListener("DOMContentLoaded", initMap);
