angular.module('hydromerta')
        .config(function ($stateProvider, $urlRouterProvider) {
            $stateProvider
    

                    .state('map', {
                        url: '/map',
                        templateUrl: 'templates/map.html'
                    })

                    .state('register', {
                        url: '/register',
                        templateUrl: 'templates/register.html',
                        controller: 'loginController'
                    })
            $urlRouterProvider.otherwise(function ($injector) {
                $injector.get('$state').go('map'); // Go to the new issue tab by default.
            });
        });