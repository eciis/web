'use strict';

(describe('Test FilterEventsByInstitutionController', function() {
    beforeEach(module('app'));

    let filterCtrl, inst, other_inst, filterList;

    beforeEach(inject(function($controller) {
        inst = {
            name: 'institution',
            enable: true
        };
    
        other_inst = {
            name: 'institution',
            enable: true
        };

        filterList = [inst, other_inst];

        filterCtrl = $controller('FilterEventsByInstitutionController');
        filterCtrl.filterList = filterList;
        filterCtrl.$onInit();
    }));


    describe('test checkChange()', function() {
        it('Should be change filterCtrl.enableAll to false', function() {
            inst.enable = false;
            other_inst.enable = true;
            filterCtrl.checkChange();
            expect(filterCtrl.enableAll).toBeFalsy();

            inst.enable = true;
            other_inst.enable = false;
            filterCtrl.checkChange();
            expect(filterCtrl.enableAll).toBeFalsy();

            inst.enable = false;
            other_inst.enable = false;
            filterCtrl.checkChange();
            expect(filterCtrl.enableAll).toBeFalsy();
        });

        it('Should be change filterCtrl.enableAll to true', function() {
            inst.enable = true;
            other_inst.enable = true;
            filterCtrl.checkChange();
            expect(filterCtrl.enableAll).toBeTruthy();
        });
    });

    describe('test enableOrDisableAll', function() {
        it('Should be enable all filters', function() {
            inst.enable = false;
            other_inst.enable = false;
            filterCtrl.enableAll = true;

            filterCtrl.enableOrDisableAll();
            expect(inst.enable).toBeTruthy();
            expect(other_inst.enable).toBeTruthy();

            inst.enable = false;
            other_inst.enable = true;
            filterCtrl.enableAll = true;

            filterCtrl.enableOrDisableAll();
            expect(inst.enable).toBeTruthy();
            expect(other_inst.enable).toBeTruthy();
        });

        it('Should be disable all filters', function() {
            inst.enable = true;
            other_inst.enable = true;
            filterCtrl.enableAll = false;

            filterCtrl.enableOrDisableAll();
            expect(inst.enable).toBeFalsy();
            expect(other_inst.enable).toBeFalsy();

            inst.enable = true;
            other_inst.enable = false;
            filterCtrl.enableAll = false;

            filterCtrl.enableOrDisableAll();
            expect(inst.enable).toBeFalsy();
            expect(other_inst.enable).toBeFalsy();
        });
    });

    describe('test cancel()', function() {
        it('Should be return to original configs', function() {
            filterCtrl.cancelAction = () => {};
            spyOn(filterCtrl, 'cancelAction');

            const originalList = [
                {
                    name: 'institution',
                    enable: true
                },
                {
                    name: 'institution',
                    enable: true
                }
            ];

            inst.enable = false;
            other_inst.enable = false;

            expect(originalList).toEqual(filterCtrl.originalList);
            expect(originalList).not.toEqual(filterCtrl.filterList);

            filterCtrl.cancel();

            expect(originalList).toEqual(filterCtrl.filterList);
            expect(filterCtrl.cancelAction).toHaveBeenCalled();
        });
    });

    describe('test $onInit', function() {
        it('Should be clone the original filterList', function() {
            spyOn(filterCtrl, 'checkChange');

            filterCtrl.originalList = [];
            filterCtrl.$onInit();

            expect(filterCtrl.originalList).toEqual(filterList);
            expect(filterCtrl.checkChange).toHaveBeenCalled();
        });
    });
}));