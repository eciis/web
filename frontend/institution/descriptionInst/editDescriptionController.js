(function(){
    const app = angular.module('app');

    app.controller("EditDescriptionController",['institution', 'InstitutionService',
        '$rootScope', '$mdDialog', function EditDescriptionController(institution, InstitutionService,
        $rootScope, $mdDialog){
        const descriptionCtrl = this;
    
        descriptionCtrl.$onInit = () => {
            descriptionCtrl.institution = institution;
            descriptionCtrl.institutionClone = _.cloneDeep(institution);
        };

        /** Save changes of institution and emit event. 
         */
        descriptionCtrl.save = () => {
            let clone = JSON.parse(angular.toJson(descriptionCtrl.institutionClone));
            let modified = JSON.parse(angular.toJson(descriptionCtrl.institution));
            const patch = jsonpatch.compare(clone, modified);
            
            InstitutionService.update(descriptionCtrl.institution.key, patch).then(
                function success() {
                    $rootScope.$emit('EDIT_DESCRIPTION_INST');
                    $mdDialog.hide();
                }
            );
        }    
    }]);
})();