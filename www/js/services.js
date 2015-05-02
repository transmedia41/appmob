angular.module('hydromerta.services', ['hydromerta.constants', 'angular-storage'])

        .factory('StorageService', function (store) {

            var service = {
                wsToken: store.get('wsToken'),
                sectors: store.get('sectors'),
                lastDisconnect: store.get('lastDisconnect'),
                lastUpdateSector: store.get('lastUpdateSector'),
                lastUpdateActionPoints: store.get('lastUpdateActionPoints'),
                actionPoints: store.get('actionPoints'),
                actionPoint: store.get('actionPoint'),
                user: store.get('user'),
                actionId: store.get('actionId'),
                actionLat: store.get('actionLat'),
                actionLng: store.get('actionLng'),
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
                },
                unsetActionPoints: function (data) {
                    service.actionPoints = null;
                    store.remove('actionPoints');
                },
                setActionPoint: function (data) {
                    service.actionPoint = data;
                    store.set('actionPoint', data);
                },
                setUser: function (data) {
                    service.user = data;
                    store.set('user', data);
                },
                setActionId: function (id) {
                    service.actionId = id;
                    store.set('actionId', id);
                },
                setActionLat: function (lat) {
                    service.actionLat = lat;
                    store.set('actionLat', lat);
                },
                setActionLng: function (lng) {
                    service.actionLng = lng;
                    store.set('actionLng', lng);
                },
            };
            return service;
        }
        )

        .service('SocketService', function ($rootScope, StorageService, $ionicPopup, $state) {

            var socket

            var socketService = {
                connect: function (t) {
                    StorageService.setToken(t)
//                    socket = io.connect("http://localhost:3000/", {
                    socket = io.connect("http://hydromerta.di-rosa.ch:3000/", {
                        query: 'token=' + t,
                        'force new connection': true
                    }).on('connect', function () {
                        $rootScope.$emit('connection')
                        socket.emit('get user')
                        socket.on('user responce', function (data) {
                            StorageService.setUser(data);
                            $rootScope.$emit('user responce', data)
                        })
                        socket.on('user responce 404', function () {
                            console.log('user responce 404')
                        })
                        socket.on('not near action', function () {
                            var popup = $ionicPopup.alert({
                                title: 'Vous êtes trop éloignés du point d\'action! Tentez de vous en approcher le plus que possible...',
                                buttons: [{
                                        text: 'Cancel',
                                        type: 'button-default',
                                        onTap: function (e) {
                                            popup.close()
                                            e.preventDefault();
                                        }
                                    },
                                ]
                            });
                        })

                        socket.on('action in cooldown', function () {
                            var date = new Date();
                            var actionPoint = StorageService.actionPoint;
                            var datePerformed = new Date(actionPoint.lastPerformed * 1000);
                            datePerformed.setSeconds(datePerformed.getSeconds() + 600);
                            var popup = $ionicPopup.alert({
                                title: 'Cette action est en cooldown! Revenez aux alentours de ' + datePerformed.getHours() + ':' + datePerformed.getMinutes() + '...',
                                buttons: [{
                                        text: 'OK',
                                        type: 'button-default',
                                        onTap: function (e) {

                                            popup.close()
                                            e.preventDefault();
                                        }
                                    },
                                ]
                            });
                        })

                        socket.on('user update', function (data) {
                            StorageService.setUser(data)
                            $rootScope.$emit('user update')
                        })

                        socket.on('new rank', function (data) {
                            var popup = $ionicPopup.alert({
                                title: data,
                                buttons: [{
                                        text: 'OK',
                                        type: 'button-default',
                                        onTap: function (e) {

                                            popup.close()
                                            e.preventDefault();
                                        }
                                    },
                                ]
                            });
                        })

                        socket.on('action point performed', function (data) {
                            var actionPoints = StorageService.actionPoints;
                            angular.forEach(actionPoints, function (oldActionPoint, key) {

                                if (oldActionPoint.id === data.id) {
                                    console.log('newActionPoint')
                                    actionPoints[key] = data

                                }
                            })


                            StorageService.setActionPoints(actionPoints)
                            StorageService.setLastUpdateActionPoints(Date.now())
                            $rootScope.$emit('new point available')
                            $state.go('map');
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
                        .emit('get sectors light')
                        .on('sectors light responce', function (data) {
                            StorageService.setSectors(data)
                            StorageService.setLastUpdateSector(Date.now())
                            //console.log('get sectors')
                            sectors = data
                            callback(sectors)
                        })
            }

            var service = {
                getSectors: function (callback) {

                    if (!StorageService.sectors) {
                        getListSectors(callback)
                    } else {
                        sectors = StorageService.sectors
                        callback(sectors)
                    }

                },
                getSectorsLocal: function (callback) {
                    callback(sectors)
                }
            }
            return service

        })



        .service('ActionPointService', function ($rootScope, StorageService, SocketService) {

            var actionPoints = []

            $rootScope.$on('connection', function (e) {
                SocketService.getSocket().on('action point performed', function (data) {
                    console.log('salut')
                    remplaceActionPoints(data)
                    $rootScope.$emit('new point available')
                })



            })



            function getListActionPoints(callback) {
                SocketService.getSocket()
                        .emit('get action point')
                        .on('action point responce', function (data) {
                            actionPoints = data
                            StorageService.setActionPoints(actionPoints)
                            StorageService.setLastUpdateActionPoints(Date.now())
                            callback(actionPoints)
                        })
            }



            function remplaceActionPoints(newActionPoint) {
                angular.forEach(actionPoints, function (oldActionPoint, key) {
                    if (oldActionPoint.id == newActionPoint.id) {
                        actionPoints[key] = newActionPoint
                    }
                })

                StorageService.setActionPoints(actionPoints)
                StorageService.setLastUpdateActionPoints(Date.now())
            }

            var service = {
                getActionPoints: function (callback) {
                    if (!StorageService.actionPoints) {
                        getListActionPoints(callback)
                    } else {
                        actionPoints = StorageService.actionPoints;
                        callback(actionPoints)
                    }

                },
                getActionPointsLocal: function (callback) {
                    callback(actionPoints)
                }
            }
            return service

        })


