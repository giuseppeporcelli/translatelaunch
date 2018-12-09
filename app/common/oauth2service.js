'use strict';

angular.module('shineCommerce.common').factory('oauth2Service', ['$http', '$q', '$window', '$location', 
    function ($http, $q, $window, $location) {

		function cleanupState() {
			// Cleaning-up state.
			$window.sessionStorage.removeItem('access_token');
			$window.sessionStorage.removeItem('expires_on');
			$window.sessionStorage.removeItem('refresh_token');
		};

        var service =  {

			hasTokens: function() {
				// Checking if an access token or a refresh token are in the session storage.
				var access_token = $window.sessionStorage.getItem('access_token');
				var refresh_token = $window.sessionStorage.getItem('refresh_token');

				if (access_token || refresh_token)
					return true;
				else
					return false;
			},

			logout: function() {
				// Building logout URL and redirecting.
				var logout_url = LOGOUT_ENDPOINT + '?client_id=' + encodeURIComponent(CLIENT_ID) +
					'&logout_uri=' + encodeURIComponent(LOGOUT_URL);

				$window.location.replace(logout_url);
			},

			authorize: function() {
				cleanupState();

				// Building authorize URL and redirecting.
				var authorize_url = AUTHORIZE_ENDPOINT + '?response_type=code&client_id=' + encodeURIComponent(CLIENT_ID) +
					'&redirect_uri=' + encodeURIComponent(REDIRECT_URI) + '&scope=' + encodeURIComponent(SCOPES);

				$window.location.replace(authorize_url);
			},

			token: function() {

				var access_token = $window.sessionStorage.getItem('access_token');
				var expires_on = $window.sessionStorage.getItem('expires_on');
				var refresh_token = $window.sessionStorage.getItem('refresh_token');

				if (access_token && expires_on &&
					expires_on > moment(new Date().getTime()).unix()) {
					
					// There is a token and it is still valid. Can just return it.
					return $q.when(access_token);
				}
				else if (refresh_token) {

					// There is a refresh token and it must be exchanged to get a fresh access token.
					var request =  {
						method: 'POST',
						url: TOKEN_ENDPOINT,
						headers: {
							'Content-Type' : 'application/x-www-form-urlencoded',
							'Authorization' : 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET) 
						},
						data: 'grant_type=refresh_token&client_id=' + CLIENT_ID + '&refresh_token=' + refresh_token +
							'&scope=' + SCOPES
					};

					return $http(request).then(
						response => {
							var tokenData = response.data;

							// Computing token expiration date.
							var expires_in_seconds = parseInt(tokenData.expires_in);
							var currentTime = new Date();
							currentTime.setSeconds(currentTime.getSeconds() + (expires_in_seconds - 60));
							var expires_on = moment(currentTime.getTime()).unix();

							$window.sessionStorage.setItem('access_token', tokenData.access_token);
							$window.sessionStorage.setItem('expires_on', expires_on);

							return $q.when(tokenData.access_token);
						},
						err => {
							// In case of error refreshing token, we assume it is not valid and just cleanup the status.
							// Might be better to check the returned status code and error code.
							console.error('Error refreshing token: ' + err);
							cleanupState();
							return $q.reject('Error refreshing token.');
						}
					);
				}
				else {
					// No tokens available; need to re-authorize to get a token.
					console.info('No tokens found. Need to re-authorize.');
					cleanupState();
					return $q.reject('No tokens found. Need to re-authorize.');
				}
			}

        };

        return service;
    }
]);