"use strict";

(describe("SideMenuItemComponent", () => {

    let componentController, states, state, rootScope, smItemCtrl, scope, item;

    const setupModels = () => {

        item = {
            icon: 'some icon',
            description: 'some description',
            stateName: 'some state',
            onClick: () => {},
            showIf: () => true
        };
    };

    beforeEach(module('app'));

    beforeEach(inject(($componentController, STATES, $state, $rootScope) => {

        componentController = $componentController;
        states = STATES;
        state = $state;
        rootScope = $rootScope;
        scope = rootScope.$new();

        setupModels();
        smItemCtrl = componentController("sideMenuItem", scope, {item: item});
    }));

    describe("Tests", () => {

        describe('getSelectedClass', () => {
            it(`should return the selected state when the
                selected item matchs the current state`, () => {
                state.current.name = states.HOME;
                expect(smItemCtrl.getSelectedClass("HOME")).toBe("selected");
            });

            it(`should return an empty string when the
                the current item does not match the current state`, () => {
                state.current.name = states.HOME;
                expect(smItemCtrl.getSelectedClass("MANAGE_INST")).toBe("");
            });
        });

        describe('show()', () => {
            it('should call the showIf function when it is defined', () => {
                spyOn(smItemCtrl.item, 'showIf');
                smItemCtrl.show();
                expect(smItemCtrl.item.showIf).toHaveBeenCalled();
            });

            it('should return true when the showIf function is not defined', () => {
                smItemCtrl.item.showIf = undefined;
                expect(smItemCtrl.show()).toBe(true);
            });
        });

    });
}));