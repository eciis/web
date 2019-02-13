(function(){
    var app = angular.module('app');

    app.controller("EditDescriptionController", function EditDescriptionController(institution, institutionKey, InstitutionService,
        ObserverRecorderService, $rootScope, $mdDialog){
        const descriptionCtrl = this;
        let observer;
    
        descriptionCtrl.$onInit = () => {
            descriptionCtrl.institution = institution;
            descriptionCtrl.currentInstitutionKey = institutionKey;
            observer = ObserverRecorderService.register(descriptionCtrl.institution);
        };

        /** Save changes of institution and emit event. 
         */
        descriptionCtrl.save = () => {
            var patch = ObserverRecorderService.generate(observer);
            InstitutionService.update(descriptionCtrl.currentInstitutionKey, patch).then(
                function success() {
                   $rootScope.$emit('EDIT_DESCRIPTION_INST');
                   $mdDialog.hide();
                }
            );
        }    
    });
    
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

        /** Listenner edit description inst event, and should refrash institution.
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