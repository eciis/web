'use strict';

(describe('Test User model', function() {
   var user, createUser;

   var inst = {
        color: 'blue',
        name: 'inst',
        key: '987654321',
        photo_url: 'pokaasodsok'
   };

   var other_inst = {
        color: 'grey',
        name: 'other_inst',
        key: '123456789',
        parent_institution: '987654321'
   };

    var other_inst_info =  {
      acronym: undefined,
      key: '123456789',
      photo_url: undefined,
      legal_nature: undefined,
      actuation_area: undefined
    };

   var inviteUser = {
        institution_key: "098745",
        type_of_invite: "USER",
        invitee: "mayzabeel@gmail.com",
        status: 'sent'
    };

    var inviteInstitution = {
        institution_key: "098745",
        type_of_invite: "INSTITUTION",
        suggestion_institution_name: "New Institution",
        invitee: "mayzabeel@gmail.com",
        status: 'sent'
    };

   var userData = {
        name: 'Tiago Pereira',
        cpf: '111.111.111-11',
        email: 'tiago.pereira@ccc.ufcg.edu.br',
        institutions: [inst],
        follows: [inst],
        invites: [inviteUser, inviteInstitution]
    };

   beforeEach(inject(function() {
        createUser = function() {
          var result = new User(userData);
          return result;
        };
   }));

   describe('User properties', function() {

        beforeEach(function() {
          user = createUser();
        });

        it('username should be Tiago Pereira', function() {
          expect(user.name).toEqual('Tiago Pereira');
        });

        it('cpf should be 111.111.111-11', function() {
          expect(user.cpf).toEqual('111.111.111-11');
        });

        it('email should be tiago.pereira@ccc.ufcg.edu.br', function() {
          expect(user.email).toEqual('tiago.pereira@ccc.ufcg.edu.br');
        });

        it('institutions should contain inst', function() {
          expect(user.institutions).toContain(inst);
        });

        it('follows should contain inst key', function() {
          expect(user.follows).toContain(inst);
        });
   });

   describe('User functions', function() {

        describe('isFollower()', function() {

          it('should be true', function() {
            user = createUser();
            expect(user.isFollower(inst)).toBe(true);
          });

          it('should be false', function() {
            user = createUser();
            expect(user.isFollower(other_inst)).toBe(false);
          });
        });

        describe('follow()', function() {

          it('follows should not contain other_inst key before follow', function() {
            user = createUser();
            expect(user.follows).not.toContain(other_inst_info);
          });

          it('follows should contain other_inst key after follow', function() {
            user = createUser();
            var other_inst_inst = new Institution(other_inst);
            user.follow(other_inst_inst);
            expect(user.follows).toContain(other_inst_info);
          });
        });

        describe('unfollow()', function() {

          it('follows should contain other_inst key before unfollow', function() {
            user = createUser();
            var other_inst = new Institution(other_inst);
            user.follow(other_inst);
            expect(user.follows).toContain(other_inst_info);
          });

          it('follows should not contain other_inst key after unfollow', function() {
            user = createUser();
            user.unfollow(other_inst);
            expect(user.follows).not.toContain(other_inst_info);
          });
        });

        describe('isMember()', function() {

          it('should is member of inst', function() {
            user = createUser();
            expect(user.isMember(inst.key)).toBe(true);
          });

          it('should not is member of other_inst', function() {
            user = createUser();
            expect(user.isMember(other_inst.key)).toBe(false);
          });
        });

        describe('addInstitution()', function() {

          it('institutions should not contain other_inst key before addInstitution', function() {
            user = createUser();
            expect(user.institutions).not.toContain(other_inst.key);
          });

          it('institutions should contain other_inst key after addInstitution', function() {
            user = createUser();
            user.addInstitution(other_inst.key);
            expect(user.institutions).toContain(other_inst.key);
          });

        });

        describe('isValid()', function() {

          it('should be true', function() {
            user = createUser();
            expect(user.isValid()).toBe(true);
          });

          it('should be false', function() {
            user = createUser();
            user.name = '';
            expect(user.isValid()).toBe(false);
          });
        });

        describe('changeInstitution', function() {

          it('should call JSON stringify', function() {
            spyOn(JSON, 'stringify').and.callThrough();

            userData.institutions = [inst, other_inst];
            user = createUser();

            expect(user.current_institution).toBe(inst);

            user.changeInstitution(other_inst);

            expect(JSON.stringify).toHaveBeenCalled();
            expect(user.current_institution).toBe(other_inst);

            var cachedUser = JSON.parse(window.localStorage.userInfo);

            expect(cachedUser.current_institution).toEqual(other_inst);
          });
        });

        describe('getPendingInvitation', function() {

          it('should return the firts invite', function() {
            user = createUser();
            expect(user.getPendingInvitation().should.not.be.empty);
            expect(user.getPendingInvitation()).toEqual(inviteUser);
          });

          it('should return the second invite', function() {
            user = createUser();
            user.invites[0].answerLater = true;
            expect(user.getPendingInvitation().should.not.be.empty);
            expect(user.getPendingInvitation()).toEqual(inviteInstitution);
          });

          it('should return none', function() {
            user.invites[1].answerLater = true;
            expect(user.getPendingInvitation()).toEqual(undefined);
          });
        });

        describe('removeInstitution', function() {

          it('should remove the institution from user.institutions',
            function() {
              userData = {
                name: 'Tiago Pereira',
                cpf: '111.111.111-11',
                email: 'tiago.pereira@ccc.ufcg.edu.br',
                institutions: [inst],
                follows: [inst],
                invites: [inviteUser, inviteInstitution]
              };
              user = createUser();
              user.removeInstitution(inst.key);
              expect(user.follows).toEqual([inst]);
              expect(user.institutions).toEqual([]);
          });

          it('should remove the institution from user.institutions and institutions_admin',
            function () {
              userData = {
                name: 'Tiago Pereira',
                cpf: '111.111.111-11',
                email: 'tiago.pereira@ccc.ufcg.edu.br',
                institutions: [inst],
                follows: [inst],
                invites: [inviteUser, inviteInstitution],
                institutions_admin: ['/api/someurl/institution/' + inst.key]
              };
              user = createUser();
              user.removeInstitution(inst.key);
              expect(user.follows).toEqual([inst]);
              expect(user.institutions).toEqual([]);
              expect(user.institutions_admin).toEqual([]);
            });
        });

        describe('removeProfile', function() {
            beforeEach(function() {
              userData = {
                name: 'User',
                cpf: '111.111.111-11',
                email: 'user@example.com',
                institutions: [inst, other_inst],
                follows: [inst, other_inst],
                institution_profiles: [
                  {institution_key: inst.key},
                  {institution_key: other_inst.key}
                ]
              };
              user = createUser();
            });

            it('should remove inst profile', function() {
              expect(user.institution_profiles).toEqual([
                  {institution_key: inst.key},
                  {institution_key: other_inst.key}
              ]);
              user.removeProfile(inst.key, false);
              expect(user.institution_profiles).toEqual([{institution_key: other_inst.key}]);
            });

            it('should remove other_inst profile', function() {
              expect(user.institution_profiles).toEqual([
                  {institution_key: inst.key},
                  {institution_key: other_inst.key}
              ]);
              user.removeProfile(other_inst.key, false);
              expect(user.institution_profiles).toEqual([{institution_key: inst.key}]);
            });

            it('should not remove inst profile', function() {
              expect(user.institution_profiles).toEqual([
                  {institution_key: inst.key},
                  {institution_key: other_inst.key}
              ]);
              user.removeProfile(other_inst.key, true);
              expect(user.institution_profiles).toEqual([{institution_key: inst.key}]);
            });

            it('should remove all profiles', function() {
              expect(user.institution_profiles).toEqual([
                  {institution_key: inst.key},
                  {institution_key: other_inst.key}
              ]);
              user.removeProfile(inst.key, true);
              expect(user.institution_profiles).toEqual([]);
            });
        });

        describe('addPermissions', function () {
          it('should add the permissions', function () {
            var user = new User({permissions: {}});

            expect(user.permissions).toEqual({});

            user.addPermissions(['edit_post'], 'key-1');
            
            expect(user.permissions).toEqual({'edit_post': {'key-1': true}});

            user.addPermissions(['remove_post'], 'key-1');
            expect(user.permissions).toEqual({ 'remove_post': { 'key-1': true }, 'edit_post': {'key-1': true} });
          });
        });

        describe('isInstitutionRequested', function() {
          it('Should return false if the key of the institution are not in institutions_requested list', function() {
            user = createUser();
            user.institutions_requested = [];
            expect(user.isInstitutionRequested(other_inst_info.key)).toBeFalsy();
          });

          it('Should return true if the key of the institution are in institutions_requested list', function() {
            user = createUser();
            user.institutions_requested = [other_inst_info.key];
            expect(user.isInstitutionRequested(other_inst_info.key)).toBeTruthy();
          });
        });

        describe('getProfileColor()', function () {
            beforeEach(() => {
                user = createUser(userData);
            });

            it('should return the profile color', function () {
                user.institution_profiles = [{institution_key: inst.key, color: 'teal'}];
                user.current_institution = inst;
                let color = user.getProfileColor();
                expect(color).toEqual('teal');
            });
        });

        describe('updateInstProfile()', function () {
            it('should update the profile', function () {
                user = createUser(userData);
                user.institution_profiles = [{institution_key: inst.key, 
                  institution: _.clone(inst)}];
                inst.name = 'test';
                inst.photo_url = 'opsakdoskaopd';
                expect(user.institution_profiles[0].institution.name).toEqual('inst');
                expect(user.institution_profiles[0].institution.photo_url).toEqual('pokaasodsok');

                user.updateInstProfile(inst);
                expect(user.institution_profiles[0].institution.name).toEqual('test');
                expect(user.institution_profiles[0].institution.photo_url).toEqual('opsakdoskaopd');
            }); 
        });

        describe('hasPermission()', function () {
            beforeEach(() => {
                user = createUser(userData);
            });

            it('should return true', function () {
                let instKey = inst.key;
                user.permissions = {};
                user.permissions['test'] = {};
                user.permissions['test'][instKey] = true;
                expect(user.hasPermission('test', instKey)).toBeTruthy();
            });

            it('should return false', function () {
                let instKey = inst.key;
                user.permissions = {};
                expect(user.hasPermission('test', instKey)).toBeFalsy();

                user.permissions['test'] = {};
                user.permissions['test']['opakdo-OPSDKAP'] = true;
                expect(user.hasPermission('test', instKey)).toBeFalsy();
            });
        });

        describe('isInactive()', function () {
            beforeEach(() => {
              user = createUser(userData);
            });

            it('should return true', function () {
                expect(user.isInactive()).toBeTruthy();
            });

            it('should return false', function () {
                user.state = 'active';
                expect(user.isInactive()).toBeFalsy();
            });
        });

        describe('addProfile()', function () {
            beforeEach(() => {
              user = createUser(userData);
            });

            it('should create institution_profiles and add the profile', function () {
                delete user.institution_profiles;
                expect(user.institution_profiles).toEqual(undefined);
                user.addProfile({});
                expect(user.institution_profiles.length).toEqual(1);
            });

            it('should add the profile', function () {
                expect(user.institution_profiles).toEqual([]);
                user.addProfile({});
                expect(user.institution_profiles.length).toEqual(1);
            });
        });

        describe('updateInstitutions()', function () {
            it('should update the institution', function () {
                user = createUser(userData);
                inst.name = "newName";
                user.updateInstitutions(inst);
                expect(user.institutions[0].name).toEqual("newName");
                expect(user.follows[0].name).toEqual("newName");
            });
        });
   });
}));