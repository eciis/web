# -*- coding: utf-8 -*-

from ..test_base import TestBase

from models import InstitutionProfile
from .. import mocks

class InstitutionProfileTest(TestBase):
    """Test the institution profile model."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        cls.test = cls.testbed.Testbed()
        cls.test.activate()
        cls.policy = cls.datastore.PseudoRandomHRConsistencyPolicy(
            probability=1)
        cls.test.init_datastore_v3_stub(consistency_policy=cls.policy)
        cls.test.init_memcache_stub()
        initModels(cls)

    def test_make(self):
        """Test the make method."""
        institution = mocks.create_institution()
        institution.name = 'institution_name'
        institution.photo_url = 'photo_url.com'
        institution.put()
        self.data_profile['institution_key'] = institution.key.urlsafe()
        profile = InstitutionProfile.create(self.data_profile)
        profile.color = "grey"
        maked_profile = {
            'office': 'member',
            'color': 'grey',
            'institution_key': institution.key.urlsafe(),
            'email': 'institutional_email',
            'phone': '88 8888-88888',
            'branch_line': '888',
            'institution': {
                'name': 'institution_name'.decode('utf8'),
                'photo_url': 'photo_url.com'.decode('utf8')
            }
        }

        self.assertEquals(
            profile.make(), maked_profile,
            "It should be equal to the maked profile"
        )

    def test_is_valid(self):
        """Test the is_valid method."""
        profile = InstitutionProfile.create(self.data_profile)
        data = self.data_profile.copy()
        data['office'] = "manager"
        other_profile = InstitutionProfile.create(data)
        profiles = [profile, other_profile]

        self.assertEquals(
            InstitutionProfile.is_valid(profiles),
            True, "It should be True"
        )

        wrong_profile = InstitutionProfile()
        wrong_profile.office = None
        profiles.append(wrong_profile)

        self.assertEquals(
            InstitutionProfile.is_valid(profiles),
            False, "It should be False"
        )

    def test_create(self):
        """Test the create method."""
        profile = InstitutionProfile.create(self.data_profile)

        for prop in self.data_profile.keys():
            self.assertEquals(
                getattr(profile, prop),
                self.data_profile.get(prop),
                "The profile property %s should be %s"
                % (prop, self.data_profile.get(prop))
            )

        with self.assertRaises(Exception):
            data = self.data_profile.copy()
            data['office'] = None
            InstitutionProfile.create(data)

        with self.assertRaises(Exception):
            data = self.data_profile.copy()
            data['institution_key'] = None
            InstitutionProfile.create(data)

        with self.assertRaises(Exception):
            data = self.data_profile.copy()
            data['institution_name'] = None
            InstitutionProfile.create(data)

        with self.assertRaises(Exception):
            data = self.data_profile.copy()
            data['institution_photo_url'] = None
            InstitutionProfile.create(data)


def initModels(cls):
    """Init the models."""
    cls.data_profile = {
        'office': 'member',
        'email': 'institutional_email',
        'phone': '88 8888-88888',
        'branch_line': '888',
        'institution_key': 'institution_key',
        'institution_name': 'institution_name',
        'institution_photo_url': 'photo_url.com'
    }
