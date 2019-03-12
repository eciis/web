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
    key: 'institution_key',
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
    current_institution: {key: "institution_key"},
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

  describe('isCurrentStepValid', () => {
    beforeEach(() => {
      // Assign a valid institution,
      // so we can both test acceptance,
      // and strip values to test for rejections
      ctrl.newInstitution = _.cloneDeep(institution);
    });

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

          ctrl.currentStep = 0;
        });

        it('should reject empty street', () => {
          ctrl.newInstitution.address.street = '';
          const validation = ctrl.isCurrentStepValid();
          expect(validation).toBeFalsy();
        });

        it('should reject empty city', () => {
          ctrl.newInstitution.address.city = '';
          const validation = ctrl.isCurrentStepValid();
          expect(validation).toBeFalsy();
        });

        it('should reject empty state', () => {
          ctrl.newInstitution.address.federal_state = '';
          const validation = ctrl.isCurrentStepValid();
          expect(validation).toBeFalsy();
        });

        it('should reject empty neighbourhood', () => {
          ctrl.newInstitution.address.cep = '';
          const validation = ctrl.isCurrentStepValid();
          expect(validation).toBeFalsy();
        });

        it('should reject empty cep', () => {
          ctrl.newInstitution.address.cep = '';
          const validation = ctrl.isCurrentStepValid();
          expect(validation).toBeFalsy();
        });

        it('should accept a complete address', () => {
          const validation = ctrl.isCurrentStepValid();
          expect(validation).toBeTruthy();
        });
      });

      describe('when its a foreign country', () => {
        beforeEach(() => {
          ctrl.newInstitution.address = {
            country: 'Argentina',
            street: '',
            federal_state: '',
            neighbourhood: '',
            city: '',
            cep: ''
          };
          ctrl.currentStep = 0;
        });

        it('should reject an empty country', () => {
          ctrl.newInstitution.address.country = '';
          const validation = ctrl.isCurrentStepValid();
          expect(validation).toBeFalsy();
        });

        it('should accept an address with only its country present', () => {
          const validation = ctrl.isCurrentStepValid();
          expect(validation).toBeTruthy();
        });
      });
    });

    describe('second step', () => {
      beforeEach(() => {
        ctrl.currentStep = 1;
      });

      it('should reject an empty name', () => {
        ctrl.newInstitution.name = '';
        const validation = ctrl.isCurrentStepValid();
        expect(validation).toBeFalsy();
      });

      it('should reject an empty actuation_area', () => {
        ctrl.newInstitution.actuation_area = '';
        const validation = ctrl.isCurrentStepValid();
        expect(validation).toBeFalsy();
      });

      it('should reject an empty legal_nature', () => {
        ctrl.newInstitution.legal_nature = '';
        const validation = ctrl.isCurrentStepValid();
        expect(validation).toBeFalsy();
      });

      it('should reject an empty institutional_email', () => {
        ctrl.newInstitution.institutional_email = '';
        const validation = ctrl.isCurrentStepValid();
        expect(validation).toBeFalsy();
      });

      it('should accept a complete institution', () => {
        const validation = ctrl.isCurrentStepValid();
        expect(validation).toBeTruthy();
      });
    });

    describe('third step', () => {
      beforeEach(() => {
        ctrl.currentStep = 2;
      });

      it('should reject an empty description', () => {
        ctrl.newInstitution.description = '';
        const validation = ctrl.isCurrentStepValid();
        expect(validation).toBeFalsy();
      });

      it('should reject an empty leader', () => {
        ctrl.newInstitution.description = '';
        const validation = ctrl.isCurrentStepValid();
        expect(validation).toBeFalsy();
      });

      it('should accept a complete institution', () => {
        const validation = ctrl.isCurrentStepValid();
        expect(validation).toBeTruthy();
      });
    });
  });
});

