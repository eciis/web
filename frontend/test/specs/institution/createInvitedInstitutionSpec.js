'use strict';

describe('Test CreateInvitedInstitutionController', function() {
  let state, statesConst, scope, institutionService, inviteService,
    authService, ctrl, imageService, mdDialog, observerRecorderService;

  const address = {
    country: 'Brasil',
    street: 'Street',
    federal_state: 'State',
    neighbourhood: 'Neighbourhood',
    city: 'City',
    cep: '12345-768'
  }

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

  beforeEach(inject(($controller, $httpBackend, $state, STATES, InviteService, InstitutionService, AuthService, ImageService, $rootScope, $mdDialog, ObserverRecorderService) => {
    state = $state;
    scope = $rootScope.$new();
    statesConst = STATES;
    authService = AuthService;
    imageService = ImageService;
    institutionService = InstitutionService;
    mdDialog = $mdDialog;
    observerRecorderService = ObserverRecorderService;
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

  describe('submit', () => {
    let patch;

    beforeEach(() => {
      ctrl.newInstitution = _.cloneDeep(institution);
      ctrl.photoSrc = 'some_image_data';
      ctrl.institutionKey = ctrl.newInstitution.key;

      // Hard code photo_url so the returned patch is equal to later patch
      ctrl.newInstitution.photo_url = 'imageurl';
      patch = jsonpatch.compare(emptyInstitution, ctrl.newInstitution);

      spyOn(mdDialog, 'show').and.callFake(() => Promise.resolve());
      spyOn(angular, 'element');
      spyOn(observerRecorderService, 'generate').and.returnValues(patch);
      spyOn(imageService, 'saveImage').and.callFake(() => {
        return Promise.resolve({ url: 'imageurl' });
      });

      spyOn(institutionService, 'save').and.callFake(() => {
        return Promise.resolve();
      });

      spyOn(institutionService, 'update').and.callFake(() => {
        return Promise.resolve(ctrl.newInstitution);
      });

      spyOn(state, 'go')
      spyOn(authService, 'save');
      spyOn(authService, 'reload').and.callFake(() => {
        return Promise.resolve();
      });

      ctrl.user = new User(userData);
      spyOn(ctrl.user, 'removeInvite');
      spyOn(ctrl.user, 'follow');
      spyOn(ctrl.user, 'addProfile');
      spyOn(ctrl.user, 'changeInstitution');
    });

    it('correctly save institution data', (done) => {
      ctrl.submit({}).then(() => {
        expect(imageService.saveImage).toHaveBeenCalledWith('some_image_data');
        expect(ctrl.newInstitution.photo_url).toEqual('imageurl');
        expect(observerRecorderService.generate).toHaveBeenCalled();
        expect(institutionService.save).toHaveBeenCalled();

        // Needed here so image url replacing is correctly tested
        patch = jsonpatch.compare(emptyInstitution, ctrl.newInstitution);
        expect(institutionService.update).toHaveBeenCalledWith(ctrl.newInstitution.key, patch);
        expect(state.go).toHaveBeenCalled();
        expect(authService.reload).toHaveBeenCalled();
        done();
      });
    });

    it('updates user data', (done) => {
      state.params.inviteKey = invite.key;

      ctrl.submit({}).then(() => {
        expect(ctrl.user.removeInvite).toHaveBeenCalledWith(invite.key);
        expect(ctrl.user.follow).toHaveBeenCalledWith(ctrl.newInstitution);
        expect(ctrl.user.addProfile).toHaveBeenCalled();
        expect(ctrl.user.changeInstitution).toHaveBeenCalledWith(ctrl.newInstitution);
        expect(ctrl.user.institutions).toContain(ctrl.newInstitution);
        expect(ctrl.user.institutions_admin).toContain(ctrl.newInstitution.key);
        done();
      });
    });
  });
});

