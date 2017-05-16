var app = angular.module("app");

app.service("GravatarService", function GravatarService($http) {
    var service = this;

    service.load = function load(email) {
        var hash = CryptoJS.MD5(email).toString();
        return $http({
            method: 'JSONP',
            url:'https://www.gravatar.com/'+hash+'.json'
        });
    };
})