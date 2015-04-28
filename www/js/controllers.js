angular.module('hydromerta.controllers', ['hydromerta.constants', 'leaflet-directive', 'hydromerta.services'])

        .controller('MapController', function ($scope, mapboxMapId, mapboxAccessToken, $http) {

            /*$ionicLoading.show({template:"<img src='img/resistance.png' height='100px'/><p class='hydro'>Coming soon...</p>"}); */
//            SectorService.getSectors();

            var mapboxTileLayer = "http://api.tiles.mapbox.com/v4/" + mapboxMapId;
            mapboxTileLayer = mapboxTileLayer + "/{z}/{x}/{y}.png?access_token=" + mapboxAccessToken;
            $scope.mapDefaults = {
                tileLayer: mapboxTileLayer,
                maxZoom: 18,
                minZoom: 12
            };
            $scope.mapCenter = {
                lat: 46.781216,
                lng: 6.647147,
                zoom: 12
            };

            $scope.maxbounds = {
                southWest: {
                    lat: 46.749859206774524,
                    lng: 6.559438705444336
                },
                northEast: {
                    lat: 46.8027621127906,
                    lng: 6.731100082397461
                }
            };
            $scope.mapMarkers = [];



            $http.get("geojson/sectors.json").success(function (data, status) {
                $scope.geojson = {
                    data: data,
                    style: {
                        fillColor: "green",
                        weight: 2,
                        opacity: 1,
                        color: 'white',
                        dashArray: '3',
                        fillOpacity: 0.7
                    }

                }
            });
        })
        .controller('actionController', function ($scope, mapboxMapId, mapboxAccessToken, $ionicLoading, $http) {

           
        })