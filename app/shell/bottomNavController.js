'use strict';

angular.module('shineCommerce.shell')
    .controller('bottomNavController', ['$scope', '$window',
    function ($scope, $window) {
        $scope.sendEmail = (emailIndex) => {
            if (emailIndex === 1){
                var email1Link = atob('bWFpbHRvOmdpYW5wb0BhbWF6b24uY29t');
                $window.location = email1Link;
            }
            else if (emailIndex === 2){
                var email2Link = atob('bWFpbHRvOmRubmF0YWxpQGFtYXpvbi5jb20=');
                $window.location = email2Link;
            }
        };
    }
]);