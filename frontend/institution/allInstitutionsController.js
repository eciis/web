'use strict';
(function() {
    var app = angular.module('app');

    app.controller("AllInstitutionsController", function AllInstitutionsController(
        $state, InstitutionService, AuthService, MessageService) {
        var allInstituinsCtrl = this;

        allInstituinsCtrl.user = AuthService.getCurrentUser();

        function loadInstitutions() {
            InstitutionService.getInstitutions().then(function success(response) {
                allInstituinsCtrl.institutions = response.data;
            }, function error(response) {
                $state.go('app.user.home');
                MessageService.showToast(response.data.msg);
            });
        }

        loadInstitutions();
    });

    app.controller("InstitutionCardController", function InstitutionCardController(
        $state, AuthService, InstitutionService, MessageService){
        var institutionCardCtrl = this;

        institutionCardCtrl.user = AuthService.getCurrentUser();

        institutionCardCtrl.goToInstitution = function goToInstitution(institutionKey) {
            $state.go('app.institution.timeline', {institutionKey: institutionKey});
        };

        institutionCardCtrl.showFollowButton = function showFollowButton() {
            return institutionCardCtrl.institution && !institutionCardCtrl.isMember && 
                   institutionCardCtrl.institution.name !== "Ministério da Saúde" &&
                   institutionCardCtrl.institution.name !== "Departamento do Complexo Industrial e Inovação em Saúde";
         };

        institutionCardCtrl.follow = function follow(){
            var promise = InstitutionService.follow(institutionCardCtrl.institution.key);
            promise.then(function success(){
                MessageService.showToast("Seguindo "+ institutionCardCtrl.institution.name);
                var institution =  {
                    acronym: institutionCardCtrl.institution.acronym,
                    key: institutionCardCtrl.institution.key,
                    photo_url: institutionCardCtrl.institution.photo_url,
                    legal_nature: institutionCardCtrl.institution.legal_nature,
                    actuation_area: institutionCardCtrl.institution.actuation_area
                };
                institutionCardCtrl.user.follow(institution);
                institutionCardCtrl.isUserFollower = institutionCardCtrl.user.isFollower(institutionCardCtrl.institution);
                AuthService.save();
            }, function error() {
                MessageService.showToast('Erro ao seguir a instituição.');
            });
            return promise;
        };

        institutionCardCtrl.unfollow = function unfollow() {
            if(institutionCardCtrl.user.isMember(institutionCardCtrl.institution.key)){
                MessageService.showToast("Você não pode deixar de seguir " + institutionCardCtrl.institution.name);
            }
            else{
                var promise = InstitutionService.unfollow(institutionCardCtrl.institution.key);
                promise.then(function success(){
                    MessageService.showToast("Deixou de seguir "+institutionCardCtrl.institution.name);
                    institutionCardCtrl.user.unfollow(institutionCardCtrl.institution);
                    institutionCardCtrl.user.isFollower(institutionCardCtrl.institution);
                    institutionCardCtrl.isUserFollower =  institutionCardCtrl.user.isFollower(institutionCardCtrl.institution);
                    AuthService.save();
                }, function error() {
                    MessageService.showToast('Erro ao deixar de seguir instituição.');
                });
                return promise;
            }
        };

        institutionCardCtrl.checkIfUserIsMember = function checkIfUserIsMember() {
            if (institutionCardCtrl.institution){
                var institutionKey = institutionCardCtrl.institution.key;
                institutionCardCtrl.isMember = institutionCardCtrl.user.isMember(institutionKey);
            }
        };

        function checkIfUserIsFollower() {
            if (institutionCardCtrl.user && institutionCardCtrl.institution){
                institutionCardCtrl.isUserFollower = institutionCardCtrl.user.isFollower(institutionCardCtrl.institution);
            }   
        }

        checkIfUserIsFollower();
        institutionCardCtrl.checkIfUserIsMember();
    });

    app.directive("institutionCardDetails", function () {
        return {
            restrict: 'E',
            templateUrl: "app/institution/institution_card.html",
            controllerAs: "instituinsCardCtrl",
            controller: "InstitutionCardController",
            scope: {},
            bindToController: {
                institution: '=',
                user: '='
            }
        };
    });
})();