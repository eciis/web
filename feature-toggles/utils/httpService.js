(function () {
    'use strict';
    
    var app = angular.module('app');

    app.service('HttpService', function HttpService($http) {
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
            return $http({
                method,
                url,
                data
            }).then(response => response.data);
        }
    });
})();