'use strict';

describe('Test CreateInvitedInstitutionController', function() {
  let state, statesConst, scope, institutionService, inviteService,
    httpBackend, authService, ctrl, imageService;

  const address = {
    cep: "11111-000",
    city: "city",
    country: "Country",
    neighbourhood: "neighbourhood",
    number: "555",
    state: "State",
    street: "Street x"
  };

  const institution = {
    name: "name",
    photo_url: "imagens/test",
    email: "email",
    state: "pending",
    key: "inst-key",
    acronym: "INST",
    legal_nature: "public",
    actuation_area: "government agencies",
    phone_number: "phone",
    cnpj: "cnpj",
    address: new Address(address),
    leader: "leader name",
    institutional_email: "email@institutional.com",
    description: "teste"
  }

  const emptyInstitution = {
    name: "name",
    key: "inst-key",
  }

  const institutions = [{
    name: 'Splab',
    key: 'institutuion_key',
    portfolio_url: '',
    followers: [],
    members: []
  }];

  const invite = {
    'invitee': 'user@email.com',
    'suggestion_institution_name': "Suggested Name",
    'type_of_invite': "INSTITUTION",
    status: 'sent',
    key: 'invite-key'
  };

  const userData = {
    name: 'name',
    key: 'user-key',
    current_institution: {key: "institutuion_key"},
    institutions: institutions,
    institutions_admin: [],
    follows: institutions,
    institution_profiles: [],
    email: ['test@test.com'],
    invites: [invite],
    state: 'active'
  }

  beforeEach(module('app'));

  beforeEach(inject(($controller, $httpBackend, $state, STATES, InviteService, InstitutionService, AuthService, ImageService, $rootScope) => {
    state = $state;
    scope = $rootScope.$new();
    statesConst = STATES;
    authService = AuthService;
    imageService = ImageService;
    institutionService = InstitutionService;
    httpBackend = $httpBackend;
    authService.login(userData);
    state.params.institutionKey = institution.key;

    ctrl = $controller('CreateInvitedInstitutionController', {
      scope,
      authService,
      institutionService,
      imageService
    });
  }));

  describe('$onInit', () => {
    it('should call initialization methods when theres a inst key', () => {
      spyOn(ctrl, 'loadInstitution').and.callFake(() => Promise.resolve());
      spyOn(authService, 'getCurrentUser').and.callFake(() => Promise.resolve());

      ctrl.$onInit();
      expect(authService.getCurrentUser).toHaveBeenCalled();
      expect(ctrl.loadInstitution).toHaveBeenCalled();
    });

    it('should redirect to STATES.HOME when theres no institution key', () => {
      state.params.institutionKey = '';
      spyOn(state, 'go').and.callThrough();
      ctrl.$onInit();
      expect(state.go).toHaveBeenCalledWith(statesConst.HOME);
    });
  });

  describe('loadInstitution', () => {
    it('should load default institution data', (done) => {
      spyOn(institutionService, 'getInstitution').and.callFake(() => Promise.resolve(emptyInstitution));
      ctrl.institutionKey = 'inst-key';

      ctrl.loadInstitution().then(() => {
        expect(institutionService.getInstitution).toHaveBeenCalledWith(institution.key);
        expect(ctrl.newInstitution).toBe(emptyInstitution);
        expect(ctrl.suggestedName).toEqual(emptyInstitution.name);
        expect(ctrl.newInstitution.photo_url).toEqual('app/images/institution.png');
        const newAddress = ctrl.newInstitution.address;
        _.mapKeys(newAddress, (value, key) => {
          if (key === 'country') {
            expect(value).toEqual('Brasil');
          } else {
            expect(value).toEqual('');
          }
        });

        done();
      });
    });
  });

  describe('nextStep', () => {
    beforeEach(() => {
      // Assign a valid institution,
      // so we can both test acceptance,
      // and strip values to test for rejections
      ctrl.newInstitution = institution;
    });

    describe('rejections', () => {

      describe('first step', () => {
        describe('when country is Brasil', () => {
          beforeEach(() => {
            ctrl.newInstitution.address = {
              country: 'Brasil',
              street: 'Street',
              federal_state: 'State',
              neighbourhood: 'Neighbourhood',
              city: 'City',
              cep: '12345-768'
            }
          });

          it('should reject empty street', () => {
            ctrl.newInstitution.address.street = '';
            ctrl.nextStep();
            expect(ctrl.currentStep).toEqual(0);
          });

          it('should reject empty city', () => {
            ctrl.newInstitution.address.city = '';
            ctrl.nextStep();
            expect(ctrl.currentStep).toEqual(0);
          });

          it('should reject empty state', () => {
            ctrl.newInstitution.address.federal_state = '';
            ctrl.nextStep();
            expect(ctrl.currentStep).toEqual(0);
          });

          it('should reject empty neighbourhood', () => {
            ctrl.newInstitution.address.cep = '';
            ctrl.nextStep();
            expect(ctrl.currentStep).toEqual(0);
          });

          it('should reject empty cep', () => {
            ctrl.newInstitution.address.cep = '';
            ctrl.nextStep();
            expect(ctrl.currentStep).toEqual(0);
          });
        });
      });

      it('should reject invalid first step', () => {
        expect(ctrl.currentStep).toEqual(0);
        ctrl.nextStep();
        expect(ctrl.currentStep).toEqual(0);
      });

      it('should reject invalid second step', () => {
        ctrl.currentStep = 1;
        expect(ctrl.currentStep).toEqual(1);
        ctrl.nextStep();
        expect(ctrl.currentStep).toEqual(1);
      });

      it('should reject invalid third step', () => {
        ctrl.currentStep = 2;
        expect(ctrl.currentStep).toEqual(2);
        ctrl.nextStep();
        expect(ctrl.currentStep).toEqual(2);
      });
    });

    describe('acceptations', () => {
      beforeEach(() => {
        ctrl.newInstitution = institution;
      });

      it('should accept valid first step', () => {
        expect(ctrl.currentStep).toEqual(0);
        ctrl.nextStep();
        expect(ctrl.currentStep).toEqual(1);
      });

      it('should accept valid second step', () => {
        ctrl.currentStep = 1;
        expect(ctrl.currentStep).toEqual(1);
        ctrl.nextStep();
        expect(ctrl.currentStep).toEqual(2);
      });

      it('should accept valid third step', () => {
        ctrl.currentStep = 2;
        expect(ctrl.currentStep).toEqual(2);
        ctrl.nextStep();
        expect(ctrl.currentStep).toEqual(3);
      });
    });
  });

});

