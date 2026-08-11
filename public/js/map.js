
const mapElement = document.getElementById("map");

const mapApiKey = mapElement.dataset.apiKey;

const coordinates = JSON.parse(
    mapElement.dataset.coordinates
);

const listingTitle = mapElement.dataset.title;
const listingLocation = mapElement.dataset.location;

maptilersdk.config.apiKey = mapApiKey;

const map = new maptilersdk.Map({
    container: "map",
    style: maptilersdk.MapStyle.STREETS,
    center: coordinates,
    zoom: 8
});

const marker = new maptilersdk.Marker({
    color: "red"
})
    .setLngLat(coordinates)
    .addTo(map);

const popup = new maptilersdk.Popup({
    offset: 25
}).setHTML(
    "<h5>" + listingTitle + "</h5>" +
    "<p><b>Location:</b> " + listingLocation + "</p>" +
    "<p>Exact location will be provided after booking.</p>"
);

marker.setPopup(popup);

setTimeout(function () {
    map.resize();
}, 100);

