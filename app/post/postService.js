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

        service.likePost = function likePost(post) {
            data = {
                "op": "replace", 
                "path": "/likes",
                "value": "1"
            };
            var deferred = $q.defer();
            $http.patch('/api/post/' + post.key + '/like', data).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.resolve(response);
            })
            return deferred.promise;
        };

        // TODO: create method to dislike
    });
})();