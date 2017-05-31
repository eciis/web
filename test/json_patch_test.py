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
        cls.user.emails.append("luiz.silva@ccc.ufcg.edu.br")
        cls.user.emails.append("fernan.luizsilva@gmail.com")


class TestOperationAdd(TestJsonPatch):
    """Class of test operation add."""

    def test_add_simple_value(self):
        """Add attribute  registration in user."""
        self.assertFalse(hasattr(self.user, 'registration'))
        json = create_json_patch('add', '/registration', '11112121')
        self.json_patch.load(json, self.user)
        self.assertTrue(hasattr(self.user, 'registration'))
        self.assertEqual(self.user.registration, '11112121')

    def test_add_object(self):
        """Add attribute  user2 in user."""
        self.assertFalse(hasattr(self.user, 'user2'))
        json = '[{"op": "add", "path": "/user2", "value": {"age": 23, "name": "Maiza"}}]'
        self.json_patch.load(json, self.user, User)
        self.assertTrue(hasattr(self.user, 'user2'))
        self.assertEqual(self.user.user2.name, 'Maiza')
        self.assertEqual(self.user.user2.age, 23)

    def test_add_in_list(self):
        """Add new email at the end of the email list of user."""
        self.assertTrue('fernan.luizsilva@hotmail.com' not in self.user.emails)
        json = create_json_patch('add', '/emails/-', 'fernan.luizsilva@hotmail.com')
        self.json_patch.load(json, self.user)
        self.assertListEqual(self.user.emails, [
            "luiz.silva@ccc.ufcg.edu.br",
            "fernan.luizsilva@gmail.com",
            "fernan.luizsilva@hotmail.com"
        ])

    def test_add_in_index_list(self):
        """Add new email in list emails of user in a specific index."""
        self.assertTrue('fernan.luizsilva@facebook.com' not in self.user.emails)
        json = create_json_patch('add', '/emails/1', 'fernan.luizsilva@facebook.com')
        self.json_patch.load(json, self.user)
        self.assertListEqual(self.user.emails, [
            "luiz.silva@ccc.ufcg.edu.br",
            "fernan.luizsilva@facebook.com",
            "fernan.luizsilva@gmail.com",
        ])

        # Add new email in list emails of user in a specific index
        self.assertTrue('fernan.luizsilva@outlook.com' not in self.user.emails)
        json = create_json_patch('add', '/emails/0', 'fernan.luizsilva@outlook.com')
        self.json_patch.load(json, self.user)
        self.assertListEqual(self.user.emails, [
            "fernan.luizsilva@outlook.com",
            "luiz.silva@ccc.ufcg.edu.br",
            "fernan.luizsilva@facebook.com",
            "fernan.luizsilva@gmail.com",
        ])

    def test_add_exists_attr(self):
        """Add attribute  registration in user."""
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

    def test_add_none_attr(self):
        """Trying to add None."""
        self.assertFalse(hasattr(self.user, 'user2'))
        json = '[{"op": "add", "path": "/user2"}]'
        with self.assertRaises(PatchException) as ex:
            self.json_patch.load(json, self.user)
        self.assertEqual(str(ex.exception), "Value can not be None")


class TestOperantionReplace(TestJsonPatch):
    """Class of test operation Replace."""

    def test_replace_simple_value(self):
        """Replece attribute name."""
        self.assertEqual(self.user.name, "Luiz")
        json = create_json_patch("replace", "/name", "Luiz Fernando da Silva")
        self.json_patch.load(json, self.user)
        self.assertNotEqual(self.user.name, "Luiz")
        self.assertEqual(self.user.name, "Luiz Fernando da Silva")

    def test_replace_object(self):
        """Replace attribute user2 in user."""
        json = '[{"op": "add", "path": "/user2", "value": {"age": 23, "name": "Maiza"}}]'
        self.json_patch.load(json, self.user, User)

        self.assertEqual(self.user.user2.name, "Maiza")
        self.assertEqual(self.user.user2.age, 23)
        json = '[{"op": "replace", "path": "/user2", "value": {"age": 19, "name": "Luiz"}}]'
        self.json_patch.load(json, self.user, User)
        self.assertNotEqual(self.user.user2.name, "Maiza")
        self.assertNotEqual(self.user.user2.age, 23)
        self.assertEqual(self.user.user2.name, "Luiz")
        self.assertEqual(self.user.user2.age, 19)

    def test_replace_in_list(self):
        """Replace email in list of emails."""
        self.assertListEqual(self.user.emails, [
            "luiz.silva@ccc.ufcg.edu.br",
            "fernan.luizsilva@gmail.com"
        ])
        json = create_json_patch("replace", "/emails/-", "fernan.luizsilva@hotmail.com")
        self.json_patch.load(json, self.user)
        self.assertListEqual(self.user.emails, [
            "luiz.silva@ccc.ufcg.edu.br",
            "fernan.luizsilva@hotmail.com"
        ])

    def test_replace_value_none(self):
        """Replace attribute without passing the value."""
        self.assertEqual(self.user.name, "Luiz")
        json = create_json_patch("replace", "/name")
        with self.assertRaises(PatchException) as ex:
            self.json_patch.load(json, self.user)
        self.assertEqual(str(ex.exception), "Value can not be None")
        self.assertEqual(self.user.name, "Luiz")
