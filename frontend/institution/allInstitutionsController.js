(function() {
    'use strict';
    var app = angular.module('app');

    app.controller("AllInstitutionsController", function AllInstitutionsController(
        $state, InstitutionService, AuthService, MessageService, $q) {
        var allInstituinsCtrl = this;

        var content = document.getElementById("content");
        var moreInstitutions = true;
        var actualPage = 0;

        allInstituinsCtrl.user = AuthService.getCurrentUser();
        allInstituinsCtrl.isLoadingInstitutions = true;
        allInstituinsCtrl.institutions = [];

        allInstituinsCtrl.loadMoreInstitutions = function loadMoreInstitutions(reload) {
            var deferred = $q.defer();

            if (reload) { allInstituinsCtrl.loadMoreInstitutions
                actualPage = 0;
                moreInstitutions = true;
                allInstituinsCtrl.institutions.splice(0, allInstituinsCtrl.institutions.length);
                allInstituinsCtrl.isLoadingInstitutions = true;
            }

            if (moreInstitutions) {
                loadInstitutions(deferred);
            } else {
                deferred.resolve();
            }

            return deferred.promise;
        };

        function loadInstitutions(deferred) {
            InstitutionService.getNextInstitutions(actualPage).then(function success(response) {
                actualPage += 1;
                moreInstitutions = response.data.next;

                _.forEach(response.data.institutions, function(institution) {
                    allInstituinsCtrl.institutions.push(institution);
                });

                allInstituinsCtrl.isLoadingInstitutions = false;
                deferred.resolve();
            }, function error(response) {
                MessageService.showToast(response.data.msg);
                deferred.reject();
            });
        }
        
        allInstituinsCtrl.loadMoreInstitutions();
        Utils.setScrollListener(content, allInstituinsCtrl.loadMoreInstitutions);
       
    }); 
})();