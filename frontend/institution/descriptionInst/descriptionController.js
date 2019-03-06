(function(){
    const app = angular.module('app');

    app.controller("DescriptionInstController", function DescriptionInstController($state, InstitutionService, $rootScope){
        const descriptionCtrl = this;
        descriptionCtrl.isLoading = false;

        descriptionCtrl.$onInit = () => {
            descriptionCtrl.isLoading = true;        
            InstitutionService.getInstitution($state.params.institutionKey).then(function(institution){
                descriptionCtrl.institution = institution;
                descriptionCtrl.isLoading = false;
            })
        };

        /** Listenner edit description inst event, and should refresh institution.
         */
        $rootScope.$on('EDIT_DESCRIPTION_INST', () => {
            descriptionCtrl.isLoading = true;
            InstitutionService.getInstitution($state.params.institutionKey).then(function(institution){
                descriptionCtrl.institution = institution;
                descriptionCtrl.isLoading = false;
            })
        });
    });
})();