angular.module('hydromerta.auth', ['hydromerta.constants'])

.controller('AuthController', function ($scope, mapboxMapId, mapboxAccessToken, $ionicLoading) {
     $scope.register = function () {

                delete $scope.error;

                $http({
                    method: 'POST',
                    url: apiUrl + '/register',
                    data: $scope.user
                }).success(function (user) {
                    var date = new Date;
                    AuthService.setUser(user);
                    AuthService.setLastLogin(date.toLocaleString());

                    // Set the next view as the root of the history.
                    // Otherwise, the next screen will have a "back" arrow pointing back to the login screen.
                    $ionicHistory.nextViewOptions({
                        disableBack: true,
                        historyRoot: true
                    });

                    // Go to the issue creation tab.
                    $state.go('app.issueMap');

                }).error(function () {

                    // If an error occurs, hide the loading message and show an error message.
                    $ionicLoading.hide();
                    $scope.error = 'Could not log in.';
                });
            };
   
})

 