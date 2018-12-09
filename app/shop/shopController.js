'use strict';

angular.module('shineCommerce.shop')
.controller('shopController', ['$scope', '$http', '$q', 'oauth2Service', 
    function ($scope, $http, $q, oauth2Service) {

    var currentPageNumber = 1;

    $scope.isBusy = false;
    $scope.products = [];
    $scope.loadMore = () => {
        $scope.isBusy = true;
        currentPageNumber +=1;
        getProducts(currentPageNumber).then(() => {
            $scope.isBusy = false;
        });
    };

    // Initialization.
    $scope.isBusy = true;
    getProducts().then(() => {
        $scope.isBusy = false;
    });
    
    // Gets products.
    function getProducts(pageNumber){
        var requestUrl = API_ENDPOINT;
        if (pageNumber){
            requestUrl += '?page_number=' + pageNumber;
        }

        var req = {
            method: 'GET',
            url: requestUrl,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        return $http(req).then(products => {
            if (products && products.data){
                products.data.forEach(function(element) {
                    $scope.products.push({
                        productId: element[0],
                        name: element[1],
                        picture: element[4]
                    });
                }, this);
            }

            return $q.when();
        });
    };

}]);
    