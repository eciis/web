(function() {
    var app = angular.module("app");

    app.service("PostService", function PostService($http, $q, AuthService) {
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
        service.post = function post(post) {
            var deferred = $q.defer();
            post.institution = AuthService.user.current_institution.key;
            $http.post("/api/post", post).then(function(response) {
                deferred.resolve(response);
            });
            return deferred.promise;
        };
    });
})();