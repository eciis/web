# -*- coding: utf-8 -*-
"""Unit tests for module JsonPatch."""

import unittest
import sys
sys.path.append("../")

from json_patch import JsonPatch


def create_json_patch(operation, path, value=None):
    """Create string of json patch."""
    json_patch = '[{"op": "%s", "path": "%s", ' % (operation, path)

    if isinstance(value, str):
        json_patch += '"value": "%s"}]' % (value)
    else:
        json_patch += '"value": %s}]' % (str(value))
    return json_patch


class User(object):
    """Pseudo class for tests."""

    def __init__(self, name, age, description=None):
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
        json = create_json_patch('add', '/registration', '11112121')
        self.json_patch.load(json, self.user)
        self.assertEqual(self.user.registration, '11112121')

        # Add new email at the end of the email list of user
        json = create_json_patch('add', '/emails/-', 'fernan.luizsilva@hotmail.com')
        self.json_patch.load(json, self.user)
        self.assertEqual(self.user.emails, [
            "luiz.silva@ccc.ucg.edu.br",
            "fernan.luizsilva@gmail.com",
            "fernan.luizsilva@hotmail.com"
        ])

        # Add new email in list emails of user in a specific index
        json = create_json_patch('add', '/emails/1', 'fernan.luizsilva@facebook.com')
        self.json_patch.load(json, self.user)
        self.assertEqual(self.user.emails, [
            "luiz.silva@ccc.ucg.edu.br",
            "fernan.luizsilva@facebook.com",
            "fernan.luizsilva@gmail.com",
            "fernan.luizsilva@hotmail.com"
        ])

        # Add new email in list emails of user in a specific index
        json = create_json_patch('add', '/emails/0', 'fernan.luizsilva@outlook.com')
        self.json_patch.load(json, self.user)
        self.assertEqual(self.user.emails, [
            "fernan.luizsilva@outlook.com",
            "luiz.silva@ccc.ucg.edu.br",
            "fernan.luizsilva@facebook.com",
            "fernan.luizsilva@gmail.com",
            "fernan.luizsilva@hotmail.com"
        ])
