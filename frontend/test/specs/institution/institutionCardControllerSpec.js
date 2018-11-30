'use strict';

(describe('Test InstitutionCardController', function () {
    let instCardCtrl, httpBackend, createCtrl, state, mdDialog,
        scope, instService, clipBoard, authService, states;

    var inst = {
        name: 'inst',
        key: '1239',
        address: {
            country: 'country',
            city: 'city'
        }
    };

    var user = new User({
        institutions: [],
        follows: []
    });

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, $httpBackend, $rootScope, $state,
        AuthService, $mdDialog, InstitutionService, ngClipboard, STATES) {
        httpBackend = $httpBackend;
        state = $state;
        mdDialog = $mdDialog;
        scope = $rootScope.$new();
        instService = InstitutionService;
        clipBoard = ngClipboard;
        authService = AuthService;
        states = STATES;

        authService.login(user);

        createCtrl = function () {
            return $controller('InstitutionCardController', {
                scope: scope,
                InstitutionService: instService,
                AuthService: authService
            });
        };

        instCardCtrl = createCtrl();
        instCardCtrl.institution = inst;
    }));

    afterEach(function () {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('goToInstitution()', function () {
        it('should call state.go', function () {
            spyOn(state, 'go');
            instCardCtrl.goToInstitution(inst.key);
            expect(state.go).toHaveBeenCalledWith(states.INST_TIMELINE, {institutionKey: inst.key});
        });
    });

    describe('limitString()', function() {
        it('should call limitString', function () {
            spyOn(Utils, 'limitString');
            instCardCtrl.limitString('testString', 8);
            expect(Utils.limitString).toHaveBeenCalled();
        }); 
    });

    describe('getAddressInfo()', function () {
        it('should call limitString', function () {
            spyOn(Utils, 'limitString');
            instCardCtrl.getAddressInfo();
            expect(Utils.limitString).toHaveBeenCalled();
        }); 
    });

    describe('copyLink()', function () {
        it('should call toClipboard', function() {
            spyOn(Utils, 'generateLink').and.callThrough();
            spyOn(clipBoard, 'toClipboard');
            instCardCtrl.copyLink();
            expect(clipBoard.toClipboard).toHaveBeenCalled();
            expect(Utils.generateLink).toHaveBeenCalled();
        });
    });

    describe('showFollowButton()', function () {
        it('should return true', function () {
            let result = instCardCtrl.showFollowButton();
            expect(result).toEqual(true);
        });

        it('should return false', function () {
            instCardCtrl.user.addInstitution(inst);
            let result = instCardCtrl.showFollowButton();
            expect(result).toEqual(false);
            
            inst.name = "Ministério da Saúde";
            result = instCardCtrl.showFollowButton();
            expect(result).toEqual(false);

            user.removeInstitution(inst.key);
            result = instCardCtrl.showFollowButton();
            expect(result).toEqual(false);

            inst.name = "Departamento do Complexo Industrial e Inovação em Saúde";
            result = instCardCtrl.showFollowButton();
            expect(result).toEqual(false);
        });
    });

    describe('follow()', function() {
        it('should follow the inst', function () {
            spyOn(instService, 'follow').and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback();
                    }
                };
            });
            spyOn(instCardCtrl.user, 'follow').and.callThrough();
            spyOn(authService, 'save');

            instCardCtrl.follow();

            expect(instService.follow).toHaveBeenCalledWith(inst.key);
            expect(instCardCtrl.user.follow).toHaveBeenCalled();
            expect(instCardCtrl.user.follows.length).toEqual(1);
            expect(authService.save).toHaveBeenCalled();
        });
    });

    describe('unfollow()', function () {
        it('should unfollow the inst', function () {
            spyOn(instService, 'unfollow').and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback();
                    }
                };
            });
            spyOn(instCardCtrl.user, 'unfollow').and.callThrough();
            spyOn(authService, 'save');

            instCardCtrl.unfollow();

            expect(instService.unfollow).toHaveBeenCalledWith(inst.key);
            expect(instCardCtrl.user.unfollow).toHaveBeenCalled();
            expect(instCardCtrl.user.follows.length).toEqual(0);
            expect(authService.save).toHaveBeenCalled();
        });

        it('should not unfollow the inst', function () {
            instCardCtrl.user.addInstitution(inst);
            instCardCtrl.user.follow(inst);
            expect(instCardCtrl.user.follows.length).toEqual(1);
            instCardCtrl.unfollow();
            expect(instCardCtrl.user.follows.length).toEqual(1);
        });
    });

    describe('isUserMember', function () {
        beforeEach(function() {
            spyOn(instCardCtrl.user, 'isMember').and.callThrough();
        });

        it('should return true', function () {
            instCardCtrl.user.addInstitution(inst);
            var result = instCardCtrl.isUserMember();
            expect(result).toBeTruthy();
        });

        it('should return false', function () {
            instCardCtrl.user.removeInstitution(inst.key);
            var result = instCardCtrl.isUserMember();
            expect(result).toBeFalsy();
        });
    });

    describe('requestInvitation', function () {
        it('should open a dialog', function () {
            spyOn(mdDialog, 'show');
            instCardCtrl.requestInvitation('event');
            expect(mdDialog.show).toHaveBeenCalled();
        })
    });

    describe('hasCover', function () {
        it('should return true', function () {
            inst.cover_photo = 'apsdpokadkkpodokpdasoo';
            expect(instCardCtrl.hasCover()).toBeTruthy();
        });

        it('should return false', function () {
          delete inst.cover_photo;
          expect(instCardCtrl.hasCover()).toBeFalsy();
          inst.cover_photo = '';
          expect(instCardCtrl.hasCover()).toBeFalsy();
        }); 
    });
}));