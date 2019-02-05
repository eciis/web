'use strict';

(describe('Test User model', function() {
  beforeEach(module('app'));
  
   let user, createUser;

   const inst = {
        color: 'blue',
        name: 'inst',
        key: '987654321',
        photo_url: 'pokaasodsok'
   };

   const other_inst = {
        color: 'grey',
        name: 'other_inst',
        key: '123456789',
        parent_institution: '987654321'
   };

   const inviteUser = {
        institution_key: "098745",
        type_of_invite: "USER",
        invitee: "mayzabeel@gmail.com",
        status: 'sent'
    };

    const inviteInstitution = {
        institution_key: "098745",
        type_of_invite: "INSTITUTION",
        suggestion_institution_name: "New Institution",
        invitee: "mayzabeel@gmail.com",
        status: 'sent'
    };

   const userData = {
        name: 'Tiago Pereira',
        cpf: '111.111.111-11',
        email: 'tiago.pereira@ccc.ufcg.edu.br',
        institutions: [inst],
        follows: [inst],
        invites: [inviteUser, inviteInstitution],
        permissions: {
          'invite-user': 'dhkajshdiuyd9898d8aduashdh'
        }
    };

   beforeEach(inject(function(UserFactory) {
        createUser = function() {
          var result = new UserFactory.user(userData);
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

        describe('hasPermission', function() {
          it('Should be return true', function() {
            user = createUser();
            expect(user.hasPermission('invite-user')).toBeTruthy();
          });

          it('Should be return false', function() {
            user = createUser();
            expect(user.hasPermission('invite-inst')).toBeFalsy();
          });
        });
   });
}));