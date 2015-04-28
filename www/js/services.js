angular.module('hydromerta.services', ['hydromerta.constants', 'angular-storage'])

        .factory('StorageService', function (store) {

            var service = {
                wsToken: store.get('wsToken'),
                sectors: store.get('sectors'),
                lastDisconnect: store.get('lastDisconnect'),
                lastUpdateSector: store.get('lastUpdateSector'),
                lastUpdateActionPoints: store.get('lastUpdateActionPoints'),
                ActionPoints: store.get('ActionPoints'),
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
                },
                setLastDisconnect: function (dateNow) {
                    service.lastDisconnect = dateNow;
                    store.set('lastDisconnect', dateNow);
                },
                setLastUpdateSector: function (dateUpdate) {
                    service.lastDisconnect = dateUpdate;
                    store.set('lastUpdateSector', dateUpdate);
                },
                setLastUpdateActionPoints: function (dateUpdate) {
                    service.lastUpdateActionPoints = dateUpdate;
                    store.set('lastUpdateActionPoints', dateUpdate);
                },
                setActionPoints: function (data) {
                    service.actionPoints = data;
                    store.set('actionPoints', data);
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

        .service('SectorService', function ($rootScope, StorageService, SocketService) {

            var sectors = []
            function getListSectors(callback) {
                SocketService.getSocket()
                        .emit('get sectors')
                        .on('sectors responce', function (data) {
                            StorageService.setSectors(data)
                            StorageService.setLastUpdateSector(Date.now())
                            //console.log('get sectors')
                            sectors = data
                            callback(sectors)
                        })
            }

            var service = {
                getSectors: function (callback) {
                    getListSectors(callback)
                },
                getSectorsLocal: function (callback) {
                    callback(sectors)
                }
            }
            return service

        })
        
        .service('ActionPointService', function ($rootScope, StorageService, SocketService) {

            var sectors = []

            $rootScope.$on('connection', function (e) {
                SocketService.getSocket().on('action point performed', function (data) {
                    //console.log(data)
                    remplaceActionPoints(data)
                    $rootScope.$emit('new point available')
                })
            })

            function getListActionPoints(callback) {
                SocketService.getSocket()
                        .emit('get action point')
                        .on('action point responce', function (data) {
                            StorageService.setActionPoints(data)
                            StorageService.setLastUpdateActionPoints(Date.now())
                            //console.log('get sectors')
                            sectors = data
                            callback(sectors)
                        })
            }

            function remplaceActionPoints(newActionPoint) {
                angular.forEach(sectors, function (oldSector, key) {
                    if (oldSector.id == newSector.id) {
                        sectors[key] = newSector
                    }
                })
//                localStorageService.set('sectors', sectors)
//                localStorageService.set('last update sectors', Date.now())
            }

            var service = {
                getActionPoints: function (callback) {
                    if (!StorageService.actionPoint) {
                        getListActionPoints(callback)
                        var lastDisconnect
                        (!StorageService.lastDisconnect) ? lastDisconnect = 0 : lastDisconnect = StorageService.lastDisconnect
                        if (lastDisconnect > StorageService.lastUpdateActionPoints) {
                            getListActionPoints(callback)
                        } else {
                            actionPoints = StorageService.actionPoints
                            callback(actionPoints)
                        }
                    }
                },
                getActionPointsLocal: function (callback) {
                    callback(actionPoints)
                },
            }
            return service

        })


