'use strict';

(describe('Test User model', function () {
  let user, createUser, Institution;

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

  const other_inst_info = {
    acronym: undefined,
    key: '123456789',
    photo_url: undefined,
    legal_nature: undefined,
    actuation_area: undefined
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
    invites: [inviteUser, inviteInstitution]
  };

  beforeEach(module('webchat'));

  beforeEach(inject((User) => {
    createUser = () => new User(userData);
    Institution = function Institution(data) {
      let t = this;
      _.extend(this, data);
    }
  }));

  describe('User properties', function () {
    beforeEach(function () {
      user = createUser();
    });

    it('username should be Tiago Pereira', function () {
      expect(user.name).toEqual('Tiago Pereira');
    });

    it('cpf should be 111.111.111-11', function () {
      expect(user.cpf).toEqual('111.111.111-11');
    });

    it('email should be tiago.pereira@ccc.ufcg.edu.br', function () {
      expect(user.email).toEqual('tiago.pereira@ccc.ufcg.edu.br');
    });

    it('institutions should contain inst', function () {
      expect(user.institutions).toContain(inst);
    });

    it('follows should contain inst key', function () {
      expect(user.follows).toContain(inst);
    });
  });

  describe('User functions', function () {
    describe('isFollower()', function () {
      it('should be true', function () {
        user = createUser();
        expect(user.isFollower(inst)).toBe(true);
      });

      it('should be false', function () {
        user = createUser();
        expect(user.isFollower(other_inst)).toBe(false);
      });
    });

    describe('follow()', function () {
      it('follows should not contain other_inst key before follow', function () {
        user = createUser();
        expect(user.follows).not.toContain(other_inst_info);
      });

      it('follows should contain other_inst key after follow', function () {
        user = createUser();
        let other_inst_inst = new Institution(other_inst);
        user.follow(other_inst_inst);
        expect(user.follows).toContain(other_inst_info);
      });
    });

    describe('unfollow()', function () {
      it('follows should contain other_inst key before unfollow', function () {
        user = createUser();
        const other_inst_inst = new Institution(other_inst);
        user.follow(other_inst_inst);
        expect(user.follows).toContain(other_inst_info);
      });

      it('follows should not contain other_inst key after unfollow', function () {
        user = createUser();
        user.unfollow(other_inst);
        expect(user.follows).not.toContain(other_inst_info);
      });
    });

    describe('isMember()', function () {
      it('should is member of inst', function () {
        user = createUser();
        expect(user.isMember(inst.key)).toBe(true);
      });

      it('should not is member of other_inst', function () {
        user = createUser();
        expect(user.isMember(other_inst.key)).toBe(false);
      });
    });

    describe('getProfileColor()', function () {
      beforeEach(() => {
        user = createUser(userData);
      });

      it('should return the profile color', function () {
        user.institution_profiles = [{ institution_key: inst.key, color: 'teal' }];
        user.current_institution = inst;
        let color = user.getProfileColor();
        expect(color).toEqual('teal');
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
  });
}));
