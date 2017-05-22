(function() {
    var app = angular.module("app");

    app.service("PostService", function PostService($http, $q) {
        var service = this;

        /** TODO 
          Autor: Mayza Nunes 18/05/2016
          Error treatment
        **/
        service.get = function getPosts() {
            var deferred = $q.defer();
            $http.get("/api/user/timeline").then(function(response) {
                deferred.resolve(response);
            });
            return deferred.promise;
        };

        /** TODO 
          Autor: Mayza Nunes 18/05/2016
          Error treatment
        **/
        /**
          FIXME: Set the post.institution before send to backend!
          Autor: Mayza Nunes 22/05/2016
        **/
        service.post = function post(post) {
            var deferred = $q.defer();
            $http.post("/api/post", post).then(function(response) {
                deferred.resolve(response);
            });
            return deferred.promise;
        };
    });
})();