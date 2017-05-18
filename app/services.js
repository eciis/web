var app = angular.module('app');

app.service("InstitutionService", function InstitutionService($http) {
  var service = this;

  service.get = function getInstitution(callback) {
    $http.get("/api/institution").then(function(info) {
      callback(info);
    });
  };

  service.delete = function deleteInstitution(id, callback) {
    $http.delete("/api/institution/"+id).then(function(info) {
      callback(info);
    }, function(error) {
      if(error.status == '404') {
        console.error("404 Instituição não encontrada.");
      }
    });
  };
});

app.service("PostService", function PostService($http, $q) {
  var service = this;

  /** TODO 
    Autor: Mayza Nunes 18/05/2016
    Error treatment
  **/
  service.get = function getPosts() {
    var deferred = $q.defer();
    $http.get("/api/user/timeline").then(function(response){
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
    $http.post("/api/post", post).then(function(response){
      deferred.resolve(response);
    });
    return deferred.promise;
  };

});