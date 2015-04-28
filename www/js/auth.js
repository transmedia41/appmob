angular.module('hydromerta.auth', ['angular-storage', 'hydromerta.services'])



        .service('HTTPAuhtService', function ($http, StorageService) {

            return {
                login: function (data) {
                    return $http.post('http://localhost:3000/login', data)
                },
                logout: function () {
                    var data = {}
                        var t = StorageService.wsToken;
                        if (t) {
                            data = {
                                token: t
                            }
                        }
                    return $http.post('http://localhost:3000/logout', data)
                },
                register: function (data) {
                    return $http.post('http://localhost:3000/register', data)
                }

            }

        })

        .controller('loginController', function ($rootScope, $scope, HTTPAuhtService, SocketService, $state) {

            function logFunc(data) {
                console.log('salut')
                HTTPAuhtService.login(data).
                        success(function (data, status, headers, config) {
                            SocketService.connect(data.token).on('connect', function () {
//                                localStorageService.set('currentPage', 'actions')
                                $state.go("map");
                            })
                        }).
                        error(function (data, status, headers, config) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                        })
            }

            $scope.loginFunc = function () {
                var data = {
                    username: $scope.username,
                    password: $scope.password
                }
                logFunc(data)
            }
            $rootScope.$on('register', function (e, data) {
                logFunc(data)
            })

        })


        .controller('registerController', function ($rootScope, $scope, HTTPAuhtService) {
            $scope.user = {};
            $scope.registerFunc = function () {
                if ($scope.user.password === $scope.user.confirm) {
                    var dataReg = {
                        username: $scope.user.username,
                        password: $scope.user.password
                    }
                    HTTPAuhtService.register(dataReg).
                            success(function (data, status, headers, config) {
                                $rootScope.$emit('register', dataReg)
                            }).error(function (data, status, headers, config) {
                    })
                } else {
                    console.log('invalide confirm password')
                }
            }

        })