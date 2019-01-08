'use strict';

(function () {
    const app = angular.module('webchat');

    app.service('HttpService', function HttpService($http) {
        const service = this;

        const POST = 'POST';
        const GET = 'GET';
        const PUT = 'PUT';
        const DELETE = 'DELETE';
        const PATCH = 'PATCH';

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
                method: method,
                url: url,
                data: data
            });
        }
    });
})();
