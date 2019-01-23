(function() {
    'use strict';

     var app = angular.module('app');

     app.component("institutionHeader", {
        templateUrl: "/app/institution/institution_header.html",
        controller: ['$state', 'STATES', function($state, STATES){
            const instHeaderCtrl = this;
            
            /** Return if should show or hide button more,
             *  show if in timeline and is admin or member.
             */
            instHeaderCtrl.showButtonMore = function showButtonMore(){
                return instHeaderCtrl.isTimeline() && (instHeaderCtrl.actionsButtons.isAdmin() || !instHeaderCtrl.isMember);
            }

            /** Return if current state is registration data on institution.
             * 
             */
            instHeaderCtrl.isTimeline = function isTimeline(){
                return $state.current.name == STATES.INST_TIMELINE;
            }
    
            /** Return if current state is registration data on institution.
             * 
             */
            instHeaderCtrl.isRegistrationData = function isRegistrationData(){
                return $state.current.name == STATES.INST_REGISTRATION_DATA;
            }

            /** Return the title of page according current state.
             */
            instHeaderCtrl.getTitle = function getTitle(){
                switch($state.current.name){
                    case STATES.INST_TIMELINE:
                        return instHeaderCtrl.actionsButtons.getLimitedName(110);
                    case STATES.INST_REGISTRATION_DATA:
                        return "Dados cadastrais";
                    case STATES.INST_LINKS:
                        return "Vínculos Institucionais";
                    case STATES.INST_MEMBERS:
                        return "Membros";
                    case STATES.INST_FOLLOWERS:
                        return "Seguidores";
                }   
            }
        }],
        controllerAs: "instHeaderCtrl",
        bindings: {
            photo: '<',
            user: '<',
            institution: '<',
            isUserFollower: '<',
            isMember: '<',
            fileBackground: '=',
            className: '@',
            actionsButtons: '<'
        }
    });
})(); 