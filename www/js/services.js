angular.module('hydromerta.services', ['hydromerta.constants', 'angular-storage'])

        .factory('StorageService', function (store) {

            var service = {
                wsToken: store.get('wsToken'),
                sectors: store.get('sectors'),
                lastDisconnect: store.get('lastDisconnect'),
                lastUpdateSector: store.get('lastDisconnect'),
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

            $rootScope.$on('connection', function (e) {
                SocketService.getSocket().on('action polygon performed', function (data) {
                    //console.log(data)
                    remplaceSector(data)
                    $rootScope.$emit('new sector available')
                })
            })

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

            function remplaceSector(newSector) {
                angular.forEach(sectors, function (oldSector, key) {
                    if (oldSector.id == newSector.id) {
                        sectors[key] = newSector
                    }
                })
                StorageService.setSectors(sectors)
                StorageService.setLastUpdateSector(Date.now())
            }

            var service = {
                getSectors: function (callback) {
                    if (!StorageService.sectors) {
                        getListSectors(callback)
                        var lastDisconnect
                        (!StorageService.lastDisconnect) ? lastDisconnect = 0 : lastDisconnect = StorageService.lastDisconnect
                        if (lastDisconnect > StorageService.lastUpdateSector) {
                            getListSectors(callback)
                        } else {
                            sectors = StorageService.sectors
                            callback(sectors)
                        }
                    }
                },
                getSectorsLocal: function (callback) {
                    callback(sectors)
                },
                getActionPoint: function () {
                    var actionPoint = []
                    angular.forEach(sectors, function (sector, key) {
                        angular.forEach(sector.properties.actionsPoint, function (point) {
                            actionPoint.push(point)
                        })
                    })
                    return actionPoint
                }
            }
            return service

        })

