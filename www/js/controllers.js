angular.module('hydromerta.controllers', ['hydromerta.constants', 'leaflet-directive'])

.controller('MapController', function ($scope, mapboxMapId, mapboxAccessToken) {
    
console.log('salut')
    var mapboxTileLayer = "http://api.tiles.mapbox.com/v4/" + mapboxMapId;
    mapboxTileLayer = mapboxTileLayer + "/{z}/{x}/{y}.png?access_token=" + mapboxAccessToken;
    $scope.mapDefaults = {
        tileLayer: mapboxTileLayer,
        minZoom: 10
    };

    $scope.mapCenter = {
        lat: 46.781216, 
        lng: 6.647147,
        zoom: 14
    };
    $scope.mapMarkers = [];
   
})