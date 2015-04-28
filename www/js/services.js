angular.module('hydromerta.services', ['hydromerta.constants', 'angular-storage'])

        .factory('StorageService', function (store) {

            var service = {
                wsToken: store.get('wsToken'),
                sectors: store.get('sectors'),
                setToken: function (t) {
                    service.wsToken = t;
                    store.set('wsToken', t);
                },
                unsetToken: function () {
                    service.wsToken = null;
                    store.remove('wsToken');
                },
                setSectors: function (data) {
                    service.sectors = data;
                    store.set('sectors', data);
                }
            };

            return service;
        })

        .service('SocketService', function ($rootScope, StorageService) {

            var socket

            var socketService = {
                connect: function (t) {
                    StorageService.setToken(t)
                    socket = io.connect('http://localhost:3000/', {
                        query: 'token=' + t,
                        'force new connection': true
                    }).on('connect', function () {
                        $rootScope.$emit('connection')
                        socket.emit('get user')
                        socket.on('user responce', function (data) {
                            $rootScope.$emit('user responce', data)
                        })
                        socket.on('user responce 404', function () {
                            console.log('user responce 404')
                        })
                    }).on('disconnect', function () {
                        socket.close()
                        StorageService.unsetToken()
                        $rootScope.$emit('disconnected')
                    }).on("error", function (error) {
                        if (error.type === "UnauthorizedError" || error.code === "invalid_token") {
                            $rootScope.$emit('invalide token')
                        } else {
                            $rootScope.$emit('error token')
                        }
                    })
                    return socket
                },
                getSocket: function () {
                    return socket
                }

            }
            return socketService

        })

//        .service('SectorService', function (localStorageService, SocketService) {
//
//            var sectors = []
//
//            function getListSectors(callback) {
//                SocketService.getSocket()
//                        .emit('get sectors')
//                        .on('sectors responce', function (data) {
//                            localStorageService.set('sectors', data)
//                            localStorageService.set('last update sectors', Date.now())
//                            //console.log('get sectors')
//                            sectors = data
//                            callback(sectors)
//                        })
//            }
//
//            var service = {
//                getSectors: function (callback) {
//                    if (localStorageService.isSupported) {
//                        if (!localStorageService.get('sectors')) {
//                            getListSectors(callback)
//                        } else {
//                            var lastDisconnect
//                            (!localStorageService.get('last disconnect')) ? lastDisconnect = 0 : lastDisconnect = localStorageService.get('last disconnect')
//                            if (lastDisconnect > localStorageService.get('last update sectors')) {
//                                getListSectors(callback)
//                            } else {
//                                sectors = localStorageService.get('sectors')
//                                callback(sectors)
//                            }
//                        }
//                    } else {
//                        $rootScope.$emit('localstorage not supported')
//                    }
//                },
//                onUpdate: function (callback) {
//                    // use socket to track update and execute callback...
//                    // update sectors and save into localstorage
//                    socket.on('sectors update', function (data) {
//                        callback(data)
//                    })
//                }
//            }
//            return service
//
//        })