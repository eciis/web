'use strict';

(function () {
    var app = angular.module('webchat');

    app.service('HttpService', function HttpService($http, $q) {
        var service = this;

        var POST = 'POST';
        var GET = 'GET';
        var PUT = 'PUT';
        var DELETE = 'DELETE';
        var PATCH = 'PATCH';

        service.get = function getMethod(url) {
            return request(GET, url);
        };

        service.post = function postMethod(url, data) {
            return request(POST, url, data);
        };

        service.put = function putMethod(url, data) {
            return request(PUT, url, data);
        };

        service.delete = function deleteMethod(url) {
            return request(DELETE, url);
        };

        service.patch = function patchMethod(url, data) {
            return request(PATCH, url, data);
        };

        function request(method, url, data) {
            var deferred = $q.defer();

            $http({
                method: method,
                url: url,
                data: data
            }).then(function success(response) {
                deferred.resolve(response.data);
            }, function error(response) {
                //MessageService.showToast(response.data.msg);
                deferred.reject(response);
            });

            return deferred.promise;
        }
    });
})();
