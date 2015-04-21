angular.module('hydromerta')
        .config(function ($stateProvider, $urlRouterProvider) {
            $stateProvider

                    .state('map', {
                        url: '/map',
                        templateUrl: 'templates/map.html'
                    })
            $urlRouterProvider.otherwise("/map");
        });