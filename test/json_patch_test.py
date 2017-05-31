# -*- coding: utf-8 -*-
"""Unit tests for module JsonPatch."""

import unittest
import sys
sys.path.append("../")

from json_patch import JsonPatch
from json_patch import PatchException


def create_json_patch(operation, path, value=None):
    """Create string of json patch."""
    json_patch = '[{"op": "%s", "path": "%s"' % (operation, path)

    if isinstance(value, str):
        json_patch += ', "value": "%s"}]' % (value)
    elif value is not None:
        json_patch += ', "value": %s}]' % (str(value))
    else:
        json_patch += '}]'
    return json_patch


class User(object):
    """class for using in tests."""

    def __init__(self, name=None, age=None, description=None):
        """Constructor of class User."""
        self.name = name
        self.age = age
        self.emails = []
        self.description = description


class TestJsonPatch(unittest.TestCase):
    """Class of test JsonPatch."""

    @classmethod
    def setUpClass(cls):
        """Class configuration at creation time."""
        cls.json_patch = JsonPatch()

    @classmethod
    def setUp(cls):
        """Configure the objects every time a test is run."""
        cls.user = User("Luiz", 19, "I'm a computer scientist.")
        cls.user.emails.append("luiz.silva@ccc.ucg.edu.br")
        cls.user.emails.append("fernan.luizsilva@gmail.com")

    def test_add(self):
        """Test operation add in JsonPatch."""
        # Add attribute  registration in user
        self.assertFalse(hasattr(self.user, 'registration'))
        json = create_json_patch('add', '/registration', '11112121')
        self.json_patch.load(json, self.user)
        self.assertEqual(self.user.registration, '11112121')

        # Add attribute  user2 in user
        self.assertFalse(hasattr(self.user, 'user2'))
        json = '[{"op": "add", "path": "/user2", "value": {"age": 23, "name": "Maiza"}}]'
        self.json_patch.load(json, self.user, User)
        self.assertEqual(self.user.user2.name, 'Maiza')
        self.assertEqual(self.user.user2.age, 23)

        # Add new email at the end of the email list of user
        self.assertTrue('fernan.luizsilva@hotmail.com' not in self.user.emails)
        json = create_json_patch('add', '/emails/-', 'fernan.luizsilva@hotmail.com')
        self.json_patch.load(json, self.user)
        self.assertEqual(self.user.emails, [
            "luiz.silva@ccc.ucg.edu.br",
            "fernan.luizsilva@gmail.com",
            "fernan.luizsilva@hotmail.com"
        ])

        # Add new email in list emails of user in a specific index
        self.assertTrue('fernan.luizsilva@facebook.com' not in self.user.emails)
        json = create_json_patch('add', '/emails/1', 'fernan.luizsilva@facebook.com')
        self.json_patch.load(json, self.user)
        self.assertEqual(self.user.emails, [
            "luiz.silva@ccc.ucg.edu.br",
            "fernan.luizsilva@facebook.com",
            "fernan.luizsilva@gmail.com",
            "fernan.luizsilva@hotmail.com"
        ])

        # Add new email in list emails of user in a specific index
        self.assertTrue('fernan.luizsilva@outlook.com' not in self.user.emails)
        json = create_json_patch('add', '/emails/0', 'fernan.luizsilva@outlook.com')
        self.json_patch.load(json, self.user)
        self.assertEqual(self.user.emails, [
            "fernan.luizsilva@outlook.com",
            "luiz.silva@ccc.ucg.edu.br",
            "fernan.luizsilva@facebook.com",
            "fernan.luizsilva@gmail.com",
            "fernan.luizsilva@hotmail.com"
        ])

    def test_add_err(self):
        """Test error in operation add."""
        # Add attribute  registration in user
        self.assertFalse(hasattr(self.user, 'registration'))
        json = create_json_patch('add', '/registration', '11112121')
        self.json_patch.load(json, self.user)
        self.assertEqual(self.user.registration, '11112121')

        # Adding existing attribute in user
        self.assertTrue(hasattr(self.user, 'registration'))
        json = create_json_patch('add', '/registration', '22222222')
        with self.assertRaises(PatchException) as ex:
            self.json_patch.load(json, self.user)
        self.assertEqual(str(ex.exception), "Attribute registration already exists")
        self.assertEqual(self.user.registration, '11112121')

        #  Trying to add None
        self.assertFalse(hasattr(self.user, 'user2'))
        json = '[{"op": "add", "path": "/user2"}]'
        with self.assertRaises(PatchException) as ex:
            self.json_patch.load(json, self.user)
        self.assertEqual(str(ex.exception), "Value can not be None")
