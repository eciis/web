(function() {
    var app = angular.module("app");

    app.service("PostService", function PostService($http, $q, AuthService) {
        var service = this;

        service.get = function getPosts() {
            var deferred = $q.defer();
            $http.get("/api/user/timeline").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.createPost = function createPost(post) {
            var deferred = $q.defer();
            $http.post("/api/post", post).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };
    });
})();