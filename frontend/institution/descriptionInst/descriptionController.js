(function(){
    var app = angular.module('app');

    app.controller("EditDescriptionController", function EditDescriptionController($state, InstitutionService, ObserverRecorderService){
        const descriptionCtrl = this;
        let observer;
    
        descriptionCtrl.isLoading = false;
        descriptionCtrl.$onInit = () => {
            descriptionCtrl.currentInstitutionKey = $state.params.institutionKey;
            descriptionCtrl.isLoading = true;
            InstitutionService.getInstitution(descriptionCtrl.currentInstitutionKey).then(function(institution){
                descriptionCtrl.institution = institution;
                descriptionCtrl.isLoading = false;
                observer = ObserverRecorderService.register(descriptionCtrl.institution);
            })
        };
    
        function patchIntitution() {
            var patch = ObserverRecorderService.generate(observer);
            InstitutionService.update(descriptionCtrl.currentInstitutionKey, patch).then(
                /*function success() {
                    if(configInstCtrl.newInstitution)
                        updateUserInstitutions(configInstCtrl.newInstitution);}*/
            );
        }
    
    });
    
    app.controller("DescriptionInstController", function DescriptionInstController($state){
        const descriptionCtrl = this;
        descriptionCtrl.isLoading = false;
        descriptionCtrl.institution = $state.params.institution;
        console.log($state.params);
    });
})();