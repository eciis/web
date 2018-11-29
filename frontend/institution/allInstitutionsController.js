(function() {
    'use strict';
    var app = angular.module('app');

    app.controller("AllInstitutionsController", function AllInstitutionsController(
        $state, InstitutionService, AuthService, MessageService, $q) {
        var allInstitutionsCtrl = this;

        var content = document.getElementById("content");
        var moreInstitutions = true;
        var actualPage = 0;

        allInstitutionsCtrl.user = AuthService.getCurrentUser();
        allInstitutionsCtrl.isLoadingInstitutions = true;
        allInstitutionsCtrl.allInstitutions = []
        allInstitutionsCtrl.institutions = [];
        allInstitutionsCtrl.filterKeyword = "";

        allInstitutionsCtrl.allInstTab = true;
        allInstitutionsCtrl.followingInstTab = false;
        allInstitutionsCtrl.memberInstTab = false;

        const FOLLOWING_TAB = 'following';
        const ALL_TAB = 'all';

        allInstitutionsCtrl.changeTab = function changeTab(nextTab) {
            if (nextTab == ALL_TAB) {
                allInstitutionsCtrl.allInstTab = true;
                allInstitutionsCtrl.followingInstTab = false;
                allInstitutionsCtrl.memberInstTab = false;
                setAllInstitutions();
            } else if (nextTab == FOLLOWING_TAB) {
                allInstitutionsCtrl.allInstTab = false;
                allInstitutionsCtrl.followingInstTab = true;
                allInstitutionsCtrl.memberInstTab = false;
                setFollowingInstitutions();
            } else {
                allInstitutionsCtrl.allInstTab = false;
                allInstitutionsCtrl.followingInstTab = false;
                allInstitutionsCtrl.memberInstTab = true;
                setMemberInstitutions();
            }
        };

        function setAllInstitutions() {
            allInstitutionsCtrl.institutions = _.clone(allInstitutionsCtrl.allInstitutions);
        }

        function setFollowingInstitutions() {
            allInstitutionsCtrl.institutions = _.filter(allInstitutionsCtrl.allInstitutions, (inst) => {
                return _.find(allInstitutionsCtrl.user.follows, followedInst => followedInst.key === inst.key);
            });
        }

        function setMemberInstitutions() {
            allInstitutionsCtrl.institutions = _.filter(allInstitutionsCtrl.allInstitutions, (inst) => {
                return _.find(allInstitutionsCtrl.user.institutions, institution => institution.key === inst.key);
            });
        }


        allInstitutionsCtrl.loadMoreInstitutions = function loadMoreInstitutions() {
            var deferred = $q.defer();

            if (moreInstitutions) {
                loadInstitutions(deferred);
            } else {
                deferred.resolve();
            }

            return deferred.promise;
        };

        allInstitutionsCtrl.getInstitutions = function getInstitutions() {
            if(allInstitutionsCtrl.filterKeyword === "" || allInstitutionsCtrl.filterKeyword === "*") {
                return allInstitutionsCtrl.institutions;
            } else {
                return allInstitutionsCtrl.institutions
                    .filter(inst =>
                        _.includes(normalizeString(inst.name), normalizeString(allInstitutionsCtrl.filterKeyword)));
            }
        };

        function normalizeString(string) {
            return Utils.normalizeString(string);
        }

        function loadInstitutions(deferred) {
            InstitutionService.getNextInstitutions(actualPage).then(function success(response) {
                actualPage += 1;
                moreInstitutions = response.next;
                
                _.forEach(response.institutions, function(institution) {
                    allInstitutionsCtrl.allInstitutions.push(institution);
                });

                allInstitutionsCtrl.isLoadingInstitutions = false;
                allInstitutionsCtrl.institutions = _.clone(allInstitutionsCtrl.allInstitutions);
                deferred.resolve();
            }, function error() {
                deferred.reject();
            });
        }
        
        allInstitutionsCtrl.loadMoreInstitutions();
        Utils.setScrollListener(content, allInstitutionsCtrl.loadMoreInstitutions); 
    }); 
})();