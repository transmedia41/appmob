angular.module('hydromerta')
        .config(function ($stateProvider, $urlRouterProvider) {
            $stateProvider

                    .state('map', {
                        url: '/map',
                        templateUrl: 'templates/map.html'
                    })
                    
                     .state('register', {
                        url: '/register',
                        templateUrl: 'templates/register.html'
                    })
            $urlRouterProvider.otherwise("/register");
        });