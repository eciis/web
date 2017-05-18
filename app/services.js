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

app.service("PostService", function PostService($http) {
  var service = this;

  //TODO Error treatment
  service.get = function getPosts() {
    return $http.get("/api/user/timeline");
  };

  //TODO Error treatment
  service.post = function post(post) {
    var deferred = $q.defer();
    return $http.post("/api/post", post);
  };
});