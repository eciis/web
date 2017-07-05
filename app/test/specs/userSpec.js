'use strict';

(describe('Test User model', function() {
   var user, createUser;

   var splab = {
        name: 'SPLAB',
        key: '987654321'
   };

   var certbio = {
        name: 'Certbio',
        key: '123456789'
   };

   var userData = {
        name: 'Tiago Pereira',
        cpf: '111.111.111-11',
        email: 'tiago.pereira@ccc.ufcg.edu.br',
        institutions: [splab],
        follows: [splab.key]
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

        it('institutions should contain splab', function() {
          expect(user.institutions).toContain(splab);
        });

        it('follows should contain splab key', function() {
          expect(user.follows).toContain(splab.key);
        });
   });

   describe('User functions', function() {

        describe('isFollower()', function() {

          it('should be true', function() {
            user = createUser();
            expect(user.isFollower(splab.key)).toBe(true);
          });

          it('should be false', function() {
            user = createUser();
            expect(user.isFollower(certbio.key)).toBe(false);
          });
        });

        describe('follow()', function() {

          it('follows should not contain certbio key before follow', function() {
            user = createUser();
            expect(user.follows).not.toContain(certbio.key);
          });

          it('follows should contain certbio key after follow', function() {
            user = createUser();
            user.follow(certbio.key);
            expect(user.follows).toContain(certbio.key);
          });
        });

        describe('unfollow()', function() {

          it('follows should contain certbio key before unfollow', function() {
            user = createUser();
            user.follow(certbio.key);
            expect(user.follows).toContain(certbio.key);
          });

          it('follows should not contain certbio key after unfollow', function() {
            user = createUser();
            user.unfollow(certbio.key);
            expect(user.follows).not.toContain(certbio.key);
          });
        });

        describe('isMember()', function() {

          it('should is member of splab', function() {
            user = createUser();
            expect(user.isMember(splab.key)).toBe(true);
          });

          it('should not is member of certbio', function() {
            user = createUser();
            expect(user.isMember(certbio.key)).toBe(false);
          });
        });

        describe('addInstitution()', function() {

          it('institutions should not contain certbio key before addInstitution', function() {
            user = createUser();
            expect(user.institutions).not.toContain(certbio.key);
          });

          it('institutions should contain certbio key after addInstitution', function() {
            user = createUser();
            user.addInstitution(certbio.key);
            expect(user.institutions).toContain(certbio.key);
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
   });    
}));