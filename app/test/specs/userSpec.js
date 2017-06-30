'use strict';

(describe('Test User model', function() {
   var createUser;

   var splab = {
        name: 'SPLAB',
        key: '987654321'
   };

   var certbio = {
        name: 'Certbio',
        key: '123456789'
   };

   var user;

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

   it('Verify the user properties', function() {
        user = createUser();
        expect(user.name).toEqual('Tiago Pereira');
        expect(user.cpf).toEqual('111.111.111-11');
        expect(user.email).toEqual('tiago.pereira@ccc.ufcg.edu.br');
        expect(user.institutions).toEqual([splab]);
        expect(user.follows).toEqual([splab.key]);
   });

   it('Test isFollower method is true', function() {
        user = createUser();
        expect(user.isFollower(splab.key)).toBe(true);
   });

   it('Test isFollower method is false', function() {
        user = createUser();
        expect(user.isFollower(certbio.key)).toBe(false);
   });

   it('Test follow method', function() {
        user = createUser();
        user.follow(certbio.key);
        expect(user.follows).toContain(certbio.key);
   });

   it('Test unfollow method', function() {
        user = createUser();
        user.follow(certbio.key);
        expect(user.follows).toContain(certbio.key);
        user.unfollow(certbio.key);
        expect(user.follows).toEqual([splab.key]);
   });

   it('Test isMember method', function() {
        user = createUser();
        expect(user.isMember(splab.key)).toBe(true);
   });

   it('Test addInstitution method', function() {
        user = createUser();
        user.addInstitution(certbio.key);
        expect(user.institutions).toContain(certbio.key);
   });

   it('Test isValid method is true', function() {
        user = createUser();
        expect(user.isValid()).toBe(true);
   });

   it('Test isValid method is false', function(){
        user = createUser();
        user.name = '';
        expect(user.isValid()).toBe(false);
   });    
}));