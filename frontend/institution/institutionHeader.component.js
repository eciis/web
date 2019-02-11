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
                const institutionKey = instHeaderCtrl.institution && instHeaderCtrl.institution.key;
                const isAdmin = instHeaderCtrl.user.isAdmin(institutionKey);

                return instHeaderCtrl.isTimeline() && 
                    ( !instHeaderCtrl.isMember || isAdmin);
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

            /** Return if current state is registration data on institution.
             * 
             */
            instHeaderCtrl.isDescription = function isDescription(){
                return $state.current.name == STATES.INST_DESCRIPTION;
            }

            /** Return the title of page according current state.
             */
            instHeaderCtrl.getTitle = function getTitle(){
                const getLimitedName = instHeaderCtrl.actionsButtons && 
                    instHeaderCtrl.actionsButtons.getLimitedName(110);
                const tileState = {
                    [STATES.INST_TIMELINE]: getLimitedName,
                    [STATES.INST_REGISTRATION_DATA]: "Dados cadastrais",
                    [STATES.INST_LINKS]: "Vínculos Institucionais",
                    [STATES.INST_DESCRIPTION]: "Descrição",
                    [STATES.INST_MEMBERS]: "Membros",
                    [STATES.INST_FOLLOWERS]: "Seguidores"
                };
                return tileState[$state.current.name];   
            }

            instHeaderCtrl.showButtonEdit = function showButtonEdit(){
                return instHeaderCtrl.isRegistrationData() || instHeaderCtrl.isDescription();
            }
            
            instHeaderCtrl.editInfo = function editInfo(){
                if(instHeaderCtrl.isDescription())instHeaderCtrl.actionsButtons.editDescription();
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
