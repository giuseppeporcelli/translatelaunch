'use strict';

angular.module('shineCommerce', [
  'ngRoute',
  'ngAria',
  'ngAnimate',
  'toastr',
  'shineCommerce.common',
  'shineCommerce.shell',
  'shineCommerce.shop'
])
.constant('USER_INFO', {
  emailAddress: '',
  name: '',
  isLoggedIn: false
})
.config(['$locationProvider', '$routeProvider', '$httpProvider', 'toastrConfig',
  function ($locationProvider, $routeProvider, $httpProvider, toastrConfig) {
    $routeProvider.otherwise({ redirectTo: '/shop' });

    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    angular.extend(toastrConfig, {
      positionClass: 'toast-bottom-right',
      timeOut: 2000
    });

  }])
.run(['$rootScope', function($rootScope)
{
}]);
