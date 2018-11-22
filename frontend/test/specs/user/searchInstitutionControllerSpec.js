'use strict';

(describe('Test SearchInstitutionController', function() {

    let searchInstCtrl, httpBackend, institutionService, state, scope, deferred;

    const institution = {
        name: 'institution',
        key: 'inst-key',
        id: 'inst-key'
    };

    const otherInstitution = {
        name: 'other institution',
        key: 'other-inst-key',
        id: 'other-inst-key'
    };

    const user = {
        name: 'User',
        key: 'user-key',
        email: 'user@email',
        state: 'active'
    };

    beforeEach(module('app'));

    beforeEach(inject(function($componentController, $httpBackend, $rootScope, $state,
         AuthService, InstitutionService, $q) {
        
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        institutionService = InstitutionService;
        deferred = $q.defer();

        AuthService.login(user);

        searchInstCtrl = $componentController('searchInstitution', scope, {
            onSelect: () => {},
            onSearch: () => {}
        });
    }));

    describe('UserInactiveController functions', function() {

        describe('getInstIcon', function () {
            it('should return the done icon', function() {
                spyOn(searchInstCtrl, 'isInstSelected').and.returnValue(true);
                expect(searchInstCtrl.getInstIcon(institution)).toEqual('done');
            });

            it('should return the account_balance icon', function() {
                spyOn(searchInstCtrl, 'isInstSelected').and.returnValue(false);
                expect(searchInstCtrl.getInstIcon(institution)).toEqual('account_balance');
            });
        });

        describe('isInstSelected', function () {
            it('should be true when the institution is selected and loaded', function() {
                searchInstCtrl.selectedInst = new Institution(institution);
                searchInstCtrl.isInstLoaded = true;
                expect(searchInstCtrl.isInstSelected(institution)).toBeTruthy();
            });

            it('should be false when the institution is selected and not loaded', function() {
                searchInstCtrl.selectedInst = new Institution(institution);
                searchInstCtrl.isInstLoaded = false;
                expect(searchInstCtrl.isInstSelected(institution)).toBeFalsy();
            });

            it('should be false when the institution is not the one selected and is loaded', function() {
                searchInstCtrl.selectedInst = new Institution(otherInstitution);
                searchInstCtrl.isInstLoaded = true;
                expect(searchInstCtrl.isInstSelected(institution)).toBeFalsy();
            });
        })

        describe('search()', function(){
            beforeEach(function () {
                spyOn(searchInstCtrl, 'onSearch');
                spyOn(institutionService, 'searchInstitutions').and.returnValue(deferred.promise);
            });
            
            it('Should return the institutions found', function(){
                const institutions = [institution, otherInstitution];
                deferred.resolve(institutions);
                searchInstCtrl.keyword = 'inst-name';
                searchInstCtrl.search();
                scope.$apply();
                expect(institutionService.searchInstitutions).toHaveBeenCalledWith(
                    searchInstCtrl.keyword, 'active', 'institution'
                );
                expect(searchInstCtrl.institutions).toEqual(institutions);
                expect(searchInstCtrl.instNotFound).toBeFalsy();
                expect(searchInstCtrl.onSearch).toHaveBeenCalledWith(institutions);
            });

            it('Should return no institution', function(){
                deferred.resolve([]);
                searchInstCtrl.keyword = 'inst-name';
                searchInstCtrl.search();
                scope.$apply();
                expect(institutionService.searchInstitutions).toHaveBeenCalledWith(
                    searchInstCtrl.keyword, 'active', 'institution'
                );
                expect(searchInstCtrl.institutions).toEqual([]);
                expect(searchInstCtrl.instNotFound).toBeTruthy();
                expect(searchInstCtrl.onSearch).toHaveBeenCalledWith([]);
            });
        });

        describe('select()', function(){
            it('should load the selected institution', function () {
                spyOn(searchInstCtrl, 'onSelect');
                spyOn(institutionService, 'getInstitution').and.returnValue(deferred.promise);
                deferred.resolve(institution);
                searchInstCtrl.select(institution);
                scope.$apply();
                expect(searchInstCtrl.selectedInst).toEqual(new Institution(institution));
                expect(searchInstCtrl.isInstLoaded).toBeTruthy();
                expect(searchInstCtrl.onSelect).toHaveBeenCalledWith(institution);
            });
        });

        describe('createInst()', function() {
            it('should go to the create_institution_form state', function() {
                spyOn(state, 'go');
                searchInstCtrl.createInst();
                expect(state.go).toHaveBeenCalledWith('create_institution_form');
            });
        });
    });
}));