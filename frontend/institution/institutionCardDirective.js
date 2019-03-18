(function() {
    'use strict';
    var app = angular.module('app');

    app.controller("InstitutionCardController", function InstitutionCardController(
        $state, AuthService, InstitutionService, STATES, MessageService, ngClipboard, $mdDialog){
        var institutionCardCtrl = this;
        var URL_INSTITUTION = '/institution/';

        institutionCardCtrl.user = AuthService.getCurrentUser();

        institutionCardCtrl.goToInstitution = function goToInstitution(institutionKey) {
            $state.go(STATES.INST_TIMELINE, {institutionKey: institutionKey});
        };

        institutionCardCtrl.limitString = function limitString(string, limit){
            return Utils.limitString(string, limit);
        };

        institutionCardCtrl.getAddressInfo = function getAddressInfo(){
            var address = institutionCardCtrl.institution.address.country;
            if(address === "Brasil"){
                address = institutionCardCtrl.institution.address.city + "/" + institutionCardCtrl.institution.address.federal_state;
            }
            return Utils.limitString(address, 25);
        };

        institutionCardCtrl.copyLink = function copyLink(){
            var url = Utils.generateLink(URL_INSTITUTION + institutionCardCtrl.institution.key + "/home");
            ngClipboard.toClipboard(url);
            MessageService.showInfoToast("O link foi copiado", true);
        };

        institutionCardCtrl.showFollowButton = function showFollowButton() {
            return institutionCardCtrl.institution && !institutionCardCtrl.isUserMember() && 
                   institutionCardCtrl.institution.name !== "Ministério da Saúde" &&
                   institutionCardCtrl.institution.name !== "Departamento do Complexo Industrial e Inovação em Saúde";
        };

        institutionCardCtrl.follow = function follow(){
            var promise = InstitutionService.follow(institutionCardCtrl.institution.key);
            promise.then(function success(){
                MessageService.showInfoToast("Seguindo "+ institutionCardCtrl.institution.name);
                institutionCardCtrl.user.follow(institutionCardCtrl.institution);
                AuthService.save();
            });
            return promise;
        };

        institutionCardCtrl.unfollow = function unfollow() {
            if (institutionCardCtrl.user.isMember(institutionCardCtrl.institution.key)){
                MessageService.showErrorToast("Você não pode deixar de seguir " + institutionCardCtrl.institution.name);
            } else {
                var promise = InstitutionService.unfollow(institutionCardCtrl.institution.key);
                promise.then(function success(){
                    institutionCardCtrl.user.unfollow(institutionCardCtrl.institution);
                    AuthService.save();
                    MessageService.showInfoToast("Deixou de seguir "+institutionCardCtrl.institution.name, true);
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
                templateUrl: InstitutionService.getRequestInvitationTemplate(),
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