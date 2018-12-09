'use strict';

angular.module('shineCommerce.shop')
.controller('productController', ['$scope', '$http', '$q', '$routeParams', 'oauth2Service', 'USER_INFO', 'toastr',
    function ($scope, $http, $q, $routeParams, oauth2Service, USER_INFO, toastr) {

        var productId = $routeParams.productId;

        $scope.reviews = [];
        $scope.review = '';
        $scope.userInfo = USER_INFO;
        $scope.isBusy = false;

        $scope.isBusy = true;
        getProduct().then(() => {
            return getProductReviews();
        }).finally(() => { $scope.isBusy = false; });

        $scope.translate = (review, languageKey) => {
            if (review && languageKey){
                $scope.isBusy = true;
                return translateProductReview(review.reviewId, languageKey).then(translatedReview => {
                    review.translatedReview = translatedReview;
                    toastr.success('Review translated successfully');
                }).catch(reason => {
                    toastr.error('Error: ' + JSON.stringify(reason));
                }).finally(() => { $scope.isBusy = false; });
            }
        };

        $scope.addReview = () => {
            var reviewText = $scope.review;

            if (!reviewText || reviewText.length < 50 || reviewText.length > 1000){
                toastr.error('The review must be at least 50 and less than 1000 characters long.');
            }
            else{
                $scope.isBusy = true;
                oauth2Service.token().then(accessToken => {
                    return addProductReview(accessToken, productId, reviewText).then(() => {
                        toastr.success('Review added successfully');
                    });
                }).catch(reason => {
                    toastr.error('Error: ' + JSON.stringify(reason));
                }).finally(() => { 
                    $scope.review = '';
                    $scope.isBusy = false;
                });
            }
        };

        // Gets a specific product.
        function getProduct() {
            var requestUrl = API_ENDPOINT + 'product?product_id=' + productId;
            
            var req = {
                method: 'GET',
                url: requestUrl,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            return $http(req).then(response => {
                if (response && response.data){
                    var element = response.data[0];

                    $scope.product = {
                        productId: element[0],
                        name: element[1],
                        category: element[2],
                        description: element[3],
                        picture: element[4],
                        price: element[6]
                    };
                }

                return $q.when();
            });
        };

        // Gets product reviews.
        function getProductReviews(){
            var requestUrl = API_ENDPOINT + 'product/reviews?product_id=' + productId;
            
            var req = {
                method: 'GET',
                url: requestUrl,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            return $http(req).then(response => {
                if (response && response.data){
                    $scope.reviews = [];

                    response.data.forEach(function(element) {
                        var formattedDate = element[4] ? moment.unix(element[4]).format('DD/MM/YYYY HH:mm:ss') : '';

                        $scope.reviews.push({
                            reviewId: element[0],
                            author: element[2],
                            review: element[3],
                            date: formattedDate,
                            translatedReview: '',
                            sentimentSupported: element[5] !== 'LanguageNotSupported',
                            sentimentIcon: element[5] === 'POSITIVE' ? 'images/happy.png' : 
                                element[5] === 'NEGATIVE' ? 'images/sad.png' : (element[5] === 'MIXED' || element[5] === 'NEUTRAL') ? 'images/neutral.png' : '',
                            languageKey: element[6],
                            translationSupported: element[6] === 'en' || element[6] === 'ar' || element[6] === 'de' || element[6] === 'cs'
                                || element[6] === 'es' || element[6] === 'fr' || element[6] === 'pt' || element[6] === 'zh' || element[6] === 'zh-TW'
                                || element[6] === 'it' || element[6] === 'ja' || element[6] === 'ru' || element[6] === 'tr'
                        });
                    }, this);
                }

                return $q.when();
            });
        };

        // Adds a product reviews.
        function addProductReview(accessToken, productId, review){
            var requestUrl = API_ENDPOINT + 'review';
            
            var req = {
                method: 'POST',
                url: requestUrl,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + accessToken
                },
                data: {
                    product_id: productId,
                    author_id: USER_INFO.name,
                    languageKey: 'en',
                    review: review,
                    date: ''
                }
            };

            return $http(req).then(response => {
                if (response.data == '0'){
                    return $q.reject('Error adding review');
                }
                else{
                    return getProductReviews();
                }
            });
        };

        // Translates a product review.
        function translateProductReview(reviewId, languageKey) {
            var requestUrl = API_ENDPOINT + 'review?review_id=' + reviewId + '&language_key=' + languageKey;
            
            var req = {
                method: 'GET',
                url: requestUrl,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            return $http(req).then(response => {
                if (response && response.data){
                    if (response.data.S) {
                        return response.data.S;
                    }
                    else {
                        return response.data;
                    }
                }
                else {
                    return $q.reject('Translation unavailable');
                }
            });
        };
}]);
