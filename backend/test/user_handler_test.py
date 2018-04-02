# coding: utf-8
"""User Handler test."""

from test_base_handler import TestBaseHandler
from handlers.user_handler import UserHandler
from mock import patch

import mocks
import json



USER_EMAIL = 'user@gmail.com'
OTHER_USER_EMAIL = 'other_user@gmail.com'
USER_URI = '/api/user'

class UserHandlerTest(TestBaseHandler):
    """Test UserHandler class."""

    def setUp(cls):
        """Provide the base for the tests."""
        super(UserHandlerTest, cls).setUp()
        methods = set(cls.webapp2.WSGIApplication.allowed_methods)
        methods.add('PATCH')
        cls.webapp2.WSGIApplication.allowed_methods = frozenset(methods)
        app = cls.webapp2.WSGIApplication([
            (USER_URI, UserHandler)
        ], debug=True)
        cls.test_app = cls.webtest.TestApp(app)
        
        """Init models"""
        # create user
        cls.user = mocks.create_user(USER_EMAIL)
        cls.user.state = 'active'
        cls.user.put()
        # create user
        cls.other_user = mocks.create_user(OTHER_USER_EMAIL)
        cls.other_user.state = 'active'
        cls.other_user.put()
        # create institution
        cls.institution = mocks.create_institution()
        cls.institution.admin = cls.user.key
        cls.institution.followers = [cls.user.key, cls.other_user.key]
        cls.institution.members = [cls.user.key, cls.other_user.key]
        cls.institution.state = 'active'
        cls.institution.put()
        # update user
        cls.user.add_institution_admin(cls.institution.key)
        # update other_user
        cls.other_user.add_institution(cls.institution.key)
        cls.other_user.follow(cls.institution.key)
        inst_profile_data = {
            "office": "Member",
            "institution_name": cls.institution.name,
            "institution_key": cls.institution.key.urlsafe(),
            "institution_photo_url": "photo.url"
        }
        cls.other_user.create_and_add_profile(inst_profile_data)


    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()

    @patch('utils.verify_token', return_value={'email': USER_EMAIL})
    def test_get(self, verify_token):
        """Test the user_handler's get method."""
        user = self.test_app.get(USER_URI).json

        self.assertEquals(
            user['name'], self.user.name, 
            "The user name is different from the expected one"
        )

        self.assertEquals(
            user['key'], self.user.key.urlsafe(), 
            "The user key is different from the expected one"
        )

        self.assertEquals(
            user['email'], self.user.email, 
            "The user email is different from the expected one"
        )
        
        inst_admin_url = 'http://localhost:80/api/key/' + self.institution.key.urlsafe()
        self.assertEquals(
            user['institutions_admin'], [inst_admin_url], 
            "The institutions_admin is different from the expected one"
        )

    @patch('utils.verify_token', return_value={'email': OTHER_USER_EMAIL})
    def test_delete(self, verify_token):
        """Test the user_handler's delete method."""
        # check the user properties before delete it
        self.assertEquals(self.other_user.state, "active", "The user state should be 'active'")
        self.assertEquals(self.other_user.institutions, [self.institution.key], 
            "The institution key should be in user institutions")
        self.assertEquals(self.other_user.follows, [self.institution.key], 
            "The institution key should be in user follows")
        self.assertTrue(self.other_user.institution_profiles != [],
            "The user institution profiles should not be empty")
        inst_profile = self.other_user.institution_profiles[0]
        self.assertEquals(inst_profile.institution_key, self.institution.key.urlsafe(), 
            "The institution profile institution_key should be equal to institution key")    
        # check institution has this user as member and follower
        self.assertTrue(self.other_user.key in self.institution.members, 
            "The user key should be in institution members")
        self.assertTrue(self.other_user.key in self.institution.followers, 
            "The user key should be in institution followers")

        # delete user
        self.test_app.delete(USER_URI)
        # update user and institution
        self.other_user = self.other_user.key.get()
        self.institution = self.institution.key.get()
        
        # assert institution has no longer the deleted user
        self.assertTrue(self.other_user.key not in self.institution.members, 
            "The user key should not be in institution members") 
        self.assertTrue(self.other_user.key not in self.institution.followers, 
            "The user key should not be in institution followers") 

        # assert user has no longer institutions and permissions
        self.assertEquals(self.other_user.state, "inactive", "The user state should be 'inactive'")
        self.assertEquals(self.other_user.institutions, [], "User institutions should be empty")
        self.assertEquals(self.other_user.follows, [], "User institutions should be empty")
        self.assertEquals(self.other_user.permissions, {}, "User permissions should be empty")
        self.assertEquals(self.other_user.institution_profiles, [], "User permissions should be empty")


    @patch('utils.verify_token', return_value={'email': OTHER_USER_EMAIL})
    def test_patch(self, verify_token):
        """Test the user_handler's patch method."""
        new_values = {
            "name": "other_name",
            "cpf": "other_cpf",
            "photo_url": "other_photo",
            "email": ["other_email"]
        }

        for prop in new_values.keys():
            # check user has different property values before patch
            self.assertNotEqual(getattr(self.user, prop), new_values[prop],
                "The user %s should not be equal to %s" % (prop, new_values[prop])
            )

            # generate patch
            patch = [{
               "op": "replace",
               "path": "/%s" % prop,
               "value": new_values[prop]
            }]
   
            # call patch method
            patched_user = self.test_app.patch(USER_URI, json.dumps(patch)).json

            # verify the patch was applyed
            self.assertEquals(patched_user[prop], new_values[prop],
                "The user %s should be equal to %s" % (prop, new_values[prop])
            )
    