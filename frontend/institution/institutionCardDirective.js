(function() {
    'use strict';
    var app = angular.module('app');

    app.controller("InstitutionCardController", function InstitutionCardController(
        $state, AuthService, InstitutionService, MessageService, ngClipboard, $mdDialog){
        var institutionCardCtrl = this;
        var URL_INSTITUTION = '/institution/';

        institutionCardCtrl.user = AuthService.getCurrentUser();

        institutionCardCtrl.goToInstitution = function goToInstitution(institutionKey) {
            $state.go('app.institution.timeline', {institutionKey: institutionKey});
        };

        institutionCardCtrl.limitString = function limitString(string, limit){
            return Utils.limitString(string, limit);
        };

        institutionCardCtrl.getAddressInfo = function getAddressInfo(){
            if(institutionCardCtrl.institution.address.country === "Brasil"){
                return institutionCardCtrl.institution.address.city + "/" + institutionCardCtrl.institution.address.federal_state
            }
            return institutionCardCtrl.institution.address.country  
        };

        institutionCardCtrl.copyLink = function copyLink(){
            var url = Utils.generateLink(URL_INSTITUTION + institutionCardCtrl.institution.key + "/home");
            ngClipboard.toClipboard(url);
            MessageService.showToast("O link foi copiado");
        };

        institutionCardCtrl.showFollowButton = function showFollowButton() {
            return institutionCardCtrl.institution && !institutionCardCtrl.isUserMember() && 
                   institutionCardCtrl.institution.name !== "Ministério da Saúde" &&
                   institutionCardCtrl.institution.name !== "Departamento do Complexo Industrial e Inovação em Saúde";
        };

        institutionCardCtrl.follow = function follow(){
            var promise = InstitutionService.follow(institutionCardCtrl.institution.key);
            promise.then(function success(){
                MessageService.showToast("Seguindo "+ institutionCardCtrl.institution.name);
                institutionCardCtrl.user.follow(institutionCardCtrl.institution);
                AuthService.save();
            }, function error() {
                MessageService.showToast('Não foi possível seguir a instituição.');
            });
            return promise;
        };

        institutionCardCtrl.unfollow = function unfollow() {
            if (institutionCardCtrl.user.isMember(institutionCardCtrl.institution.key)){
                MessageService.showToast("Você não pode deixar de seguir " + institutionCardCtrl.institution.name);
            } else {
                var promise = InstitutionService.unfollow(institutionCardCtrl.institution.key);
                promise.then(function success(){
                    institutionCardCtrl.user.unfollow(institutionCardCtrl.institution);
                    AuthService.save();
                    MessageService.showToast("Deixou de seguir "+institutionCardCtrl.institution.name);
                }, function error() {
                    MessageService.showToast('Erro ao deixar de seguir instituição.');
                });
                return promise;
            }
        };

        institutionCardCtrl.isUserMember = function isUserMember() {
            var institutionKey = institutionCardCtrl.institution && institutionCardCtrl.institution.key;
            return institutionKey && institutionCardCtrl.user.isMember(institutionKey);
        };

        institutionCardCtrl.requestInvitation = function requestInvitation(event) {
            $mdDialog.show({
                controller: "RequestInvitationController",
                controllerAs: "requestInvCtrl",
                templateUrl: 'app/requests/request_invitation_dialog.html',
                parent: angular.element(document.body),
                targetEvent: event,
                locals: {
                    institution: institutionCardCtrl.institution
                },
                bindToController: true,
                clickOutsideToClose:true,
                openFrom: '#fab-new-post',
                closeTo: angular.element(document.querySelector('#fab-new-post'))
            });
        };

        institutionCardCtrl.hasCover = function hasCover() {
            return institutionCardCtrl.institution.cover_photo && !_.isEmpty(institutionCardCtrl.institution.cover_photo);
        };
    });

    app.directive("institutionCardDetails", function () {
        return {
            restrict: 'E',
            templateUrl: "app/institution/institution_card.html",
            controllerAs: "institutionCardCtrl",
            controller: "InstitutionCardController",
            scope: {},
            bindToController: {
                institution: '='
            }
        };
    });
})();