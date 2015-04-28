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
                    

                    .state('actionDetail', {
                        url: '/action',
                        templateUrl: 'templates/actionDetail.html',
                        controller: 'actionController'
                    })
            $urlRouterProvider.otherwise(function ($injector) {
                $injector.get('$state').go('map'); // Go to the new issue tab by default.
            });
        });