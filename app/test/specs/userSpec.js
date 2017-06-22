'use strict';

(describe('Test User model', function() {
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
        user = new User(userData);
   }));

   it('Verify the user properties', function() {
        expect(user.name).toEqual('Tiago Pereira');
        expect(user.cpf).toEqual('111.111.111-11');
        expect(user.email).toEqual('tiago.pereira@ccc.ufcg.edu.br');
        expect(user.institutions).toEqual([splab]);
        expect(user.follows).toEqual([splab.key]);
   });

   it('Test follow method', function() {
        user.follow(certbio.key);
        expect(user.follows).toContain(certbio.key);
   });

   it('Test unfollow method', function() {
        expect(user.follows).toContain(certbio.key);
        user.unfollow(certbio.key);
        expect(user.follows).toEqual([splab.key]);
   });

   it('Test isMember method', function() {
        expect(user.isMember(splab.key)).toBe(true);
   });

   it('Test addInstitution method', function() {
        user.addInstitution(certbio.key);
        expect(user.institutions).toContain(certbio.key);
   });

   it('Test isValid method', function() {
        expect(user.isValid()).toBe(true);
   });
}));