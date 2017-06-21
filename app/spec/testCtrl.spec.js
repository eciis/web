describe('Name of the group', function() {
    beforeEach(module('app'));

    var ctrl;

    beforeEach(inject(function($controller) {
        ctrl = $controller('TestController');
    }));

    it('should behave...', function() {
        expect(ctrl.num).toEqual(100);
    });
});