(function(){
    const app = angular.module('app');

    app.controller("EditDescriptionController", function EditDescriptionController(institution, InstitutionService,
        ObserverRecorderService, $rootScope, $mdDialog){
        const descriptionCtrl = this;
        let observer;
    
        descriptionCtrl.$onInit = () => {
            descriptionCtrl.institution = institution;
            observer = ObserverRecorderService.register(descriptionCtrl.institution);
        };

        /** Save changes of institution and emit event. 
         */
        descriptionCtrl.save = () => {
            const patch = ObserverRecorderService.generate(observer);
            InstitutionService.update(descriptionCtrl.institution.key, patch).then(
                function success() {
                    console.log("-------------------------")
                    $rootScope.$emit('EDIT_DESCRIPTION_INST');
                    $mdDialog.hide();
                }
            );
        }    
    });
})();