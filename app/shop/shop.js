'use strict';

angular.module('shineCommerce.shop', ['ngRoute', 'ui.bootstrap', 'shineCommerce.common'])
	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/shop', {
			templateUrl: 'views/shop.html',
			controller: 'shopController'
		})
		.when('/product/:productId', {
			templateUrl: 'views/product.html',
			controller: 'productController'
		});
}]);