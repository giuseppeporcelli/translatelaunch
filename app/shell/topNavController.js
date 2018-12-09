'use strict';

angular.module('shineCommerce.shell')
    .controller('topNavController', ['$scope', '$location', '$window', 'oauth2Service', 'USER_INFO',
    function ($scope, $location, $window, oauth2Service, USER_INFO) {

        $scope.isLoggedIn = false;
        $scope.emailAddress = '';
        
        $scope.logout = () => {
            $window.sessionStorage.setItem('current_path', $location.path());
            oauth2Service.logout();
        };

        $scope.login = () => {            
            $window.sessionStorage.setItem('current_path', $location.path());
            if (oauth2Service.hasTokens()){
                oauth2Service.token().then(accessToken => {
                    return getUserInfo(accessToken);
                }).catch(reason => {
                    oauth2Service.authorize();
                });
            }
            else {
                oauth2Service.authorize();
            }
        };

        if (oauth2Service.hasTokens()){
            oauth2Service.token().then(accessToken => {
                return getUserInfo(accessToken);
            });
        }
        
        // Gets user information.
        function getUserInfo(access_token) {
            AWSCognito.config.region = 'us-east-1';
            var provider = new AWSCognito.CognitoIdentityServiceProvider();

            var params = { 
                AccessToken: access_token
            };

            provider.getUser(params, function(err, result) {
                if (err) {
                    console.error(JSON.stringify(err));
                    return;
                }
                if (result && result.UserAttributes){
                    for (var index in result.UserAttributes){
                        var attribute = result.UserAttributes[index];
                        if (attribute.Name == 'email'){
                            USER_INFO.isLoggedIn = true;
                            USER_INFO.emailAddress = attribute.Value;
                            $scope.emailAddress = attribute.Value;
                            $scope.isLoggedIn = true;
                        }
                        else if (attribute.Name == 'name'){
                            USER_INFO.name = attribute.Value;
                        }

                        $scope.$apply();
                    }
                }
            });
        };
    }
]);