# -*- coding: utf-8 -*-
"""Unit tests for module JsonPatch."""

import unittest

from . import JsonPatch
from . import PatchException


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


class Vehicle(object):
    """Class Vehicle for using in tests."""

    def __init__(self, num_wheels=None, brand=None):
        """Constructor of class Vehicle."""
        self.num_wheels = num_wheels
        self.brand = brand


class User(object):
    """Class for using in tests."""

    def __init__(self, name=None, age=None, description=None):
        """Constructor of class User."""
        self.name = name
        self.age = age
        self.parents = []
        self.emails = []
        self.description = description


def define_entity(dictionary):
    """Return the corresponding class."""
    if isUser(dictionary):
        return User
    elif isVehicle(dictionary):
        return Vehicle
    else:
        return dict


def isVehicle(dictionary):
    """Verify if the dictionary matches an instance of a vehicle."""
    num_wheels = dictionary.get('num_wheels', None)
    brand = dictionary.get('brand', None)

    return num_wheels and brand


def isUser(dictionary):
    """Verify if the dictionary matches an instance of a user."""
    name = dictionary.get('name', None)
    age = dictionary.get('age', None)

    return name and age


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
        self.assertFalse(
            hasattr(self.user, 'registration'),
            "The registration attribute must not exist"
        )
        json = create_json_patch('add', '/registration', '11112121')
        self.json_patch.load(json, self.user)
        self.assertTrue(
            hasattr(self.user, 'registration'),
            "Registration attribute must exist"
        )
        self.assertEqual(
            self.user.registration,
            '11112121',
            "Registration must be equal to 11112121"
        )

    def test_add_object(self):
        """Add attribute  other_user in user."""
        self.assertFalse(
            hasattr(self.user, 'other_user'),
            "The attribute other_user must not exist"
        )
        json = '[{"op": "add", "path": "/other_user", "value": {"age": 23, "name": "Mayza"}}]'
        self.json_patch.load(json, self.user, define_entity)
        self.assertTrue(
            hasattr(self.user, 'other_user'),
            "The attribute other_user must exist"
        )
        self.assertEqual(
            self.user.other_user.name, 'Mayza',
            "Other_user name must be Mayza"
        )
        self.assertEqual(
            self.user.other_user.age,
            23,
            "Other_user age must be 23"
        )

    def test_add_in_list(self):
        """Add new email at the end of the email list of user."""
        self.assertFalse(
            'fernan.luizsilva@hotmail.com' in self.user.emails,
            "Email must not exist in list"
        )
        json = create_json_patch('add', '/emails/-', 'fernan.luizsilva@hotmail.com')
        self.json_patch.load(json, self.user)
        self.assertListEqual(self.user.emails, [
            "luiz.silva@ccc.ufcg.edu.br",
            "fernan.luizsilva@gmail.com",
            "fernan.luizsilva@hotmail.com"
        ], "Email must exist in list")

    def test_add_in_index_list(self):
        """Add new email in list emails of user in a specific index."""
        self.assertFalse(
            'fernan.luizsilva@facebook.com' in self.user.emails,
            "Email must not exist in list")
        json = create_json_patch('add', '/emails/1', 'fernan.luizsilva@facebook.com')
        self.json_patch.load(json, self.user)
        self.assertListEqual(self.user.emails, [
            "luiz.silva@ccc.ufcg.edu.br",
            "fernan.luizsilva@facebook.com",
            "fernan.luizsilva@gmail.com",
        ], "Email must exist in list")

        # Add new email in list emails of user in a specific index
        self.assertFalse(
            'fernan.luizsilva@outlook.com' in self.user.emails,
            "Email must not exist in list")
        json = create_json_patch('add', '/emails/0', 'fernan.luizsilva@outlook.com')
        self.json_patch.load(json, self.user)
        self.assertListEqual(self.user.emails, [
            "fernan.luizsilva@outlook.com",
            "luiz.silva@ccc.ufcg.edu.br",
            "fernan.luizsilva@facebook.com",
            "fernan.luizsilva@gmail.com",
        ], "Email must exist in list")

    def test_add_exists_attr(self):
        """Add attribute  registration in user."""
        self.assertFalse(
            hasattr(self.user, 'registration'),
            "Registration attribute must not exist")
        json = create_json_patch('add', '/registration', '11112121')
        self.json_patch.load(json, self.user)
        self.assertEqual(
            self.user.registration, '11112121',
            "Registration must be equal to 11112121")

        # Adding existing attribute in user
        self.assertTrue(
            hasattr(self.user, 'registration'),
            "The registration attribute must exist")
        json = create_json_patch('add', '/registration', '22222222')
        with self.assertRaises(PatchException) as ex:
            self.json_patch.load(json, self.user)
        self.assertEqual(
            str(ex.exception), "Attribute registration already exists",
            "Expected message to be equal to 'Attribute registration already exists'")
        self.assertEqual(
            self.user.registration, '11112121',
            "Registration must be equal to 11112121")

    def test_add_none_attr(self):
        """Trying to add None."""
        self.assertFalse(
            hasattr(self.user, 'other_user'),
            "Other_user attribute must not exist")
        json = '[{"op": "add", "path": "/other_user"}]'
        with self.assertRaises(PatchException) as ex:
            self.json_patch.load(json, self.user)
        self.assertEqual(
            str(ex.exception), "Value can not be None",
            "Expected message to be equal to 'Value can not be None'")

    def test_add_dict(self):
        """Test add dict."""
        json = '[{"op": "add", "path": "/parents/-", "value": {"age": 19, "name": "Luiz"}}]'
        self.json_patch.load(json, self.user)
        parent = self.user.parents[-1]

        self.assertTrue(
            isinstance(parent, dict),
            "Expected instance must be equal to dict")
        self.assertEqual(
            parent['age'],
            19,
            "Age must be equal to 19")
        self.assertEqual(
            parent['name'],
            "Luiz",
            "Name must be equal to Luiz")

    def test_add_multiples_objects(self):
        """Test add multiples objects."""
        obj = '{"name": "Luiz", "age": 20, "vehicle": {"num_wheels": 4, "brand": "Test"}}'
        json = '[{"op": "add", "path": "/parents/-", "value":' + obj + '}]'
        self.json_patch.load(json, self.user, define_entity)

        parent = self.user.parents[-1]

        self.assertTrue(
            isinstance(parent, User),
            "Expected instance must be equal to User")
        self.assertTrue(
            isinstance(parent.vehicle, Vehicle),
            "Expected instance must be equal to Vehicle")

        self.assertEqual(
            parent.name,
            "Luiz",
            "Name must be equal to Luiz")

        self.assertEqual(
            parent.age,
            20,
            "Age must be equal to 20")

        self.assertEqual(
            parent.vehicle.num_wheels,
            4,
            "num_wheels must be equal to 4")

        self.assertEqual(
            parent.vehicle.brand,
            "Test",
            "Brand must be equal to Test")


class TestOperantionReplace(TestJsonPatch):
    """Class of test operation Replace."""

    def test_replace_simple_value(self):
        """Replece attribute name."""
        self.assertEqual(self.user.name, "Luiz", "Name must be equal to Luiz")
        json = create_json_patch("replace", "/name", "Luiz Fernando da Silva")
        self.json_patch.load(json, self.user)
        self.assertNotEqual(self.user.name, "Luiz", "Name must not be equal to Luiz")
        self.assertEqual(
            self.user.name, "Luiz Fernando da Silva",
            "Name must be equal to Luiz Fernando da Silva")

    def test_replace_object(self):
        """Replace attribute other_user in user."""
        json = '[{"op": "add", "path": "/other_user", "value": {"age": 23, "name": "Mayza"}}]'
        self.json_patch.load(json, self.user, define_entity)

        self.assertEqual(
            self.user.other_user.name, "Mayza",
            "Name must be equal to Mayza")
        self.assertEqual(self.user.other_user.age, 23, "Age must be equal to 23")
        json = '[{"op": "replace", "path": "/other_user", "value": {"age": 19, "name": "Luiz"}}]'
        self.json_patch.load(json, self.user, define_entity)
        self.assertNotEqual(
            self.user.other_user.name, "Mayza",
            "Name must not be equal to Mayza")
        self.assertNotEqual(
            self.user.other_user.age, 23,
            "Age must not be equal to 23")
        self.assertEqual(
            self.user.other_user.name, "Luiz",
            "Name must be equal to Luiz")
        self.assertEqual(self.user.other_user.age, 19, "Age must be equal to 19")

    def test_replace_in_list(self):
        """Replace email in list of emails."""
        self.assertListEqual(self.user.emails, [
            "luiz.silva@ccc.ufcg.edu.br",
            "fernan.luizsilva@gmail.com"
        ], "Lists emails must be equal to")
        json = create_json_patch("replace", "/emails/-", "fernan.luizsilva@hotmail.com")
        self.json_patch.load(json, self.user)
        self.assertListEqual(self.user.emails, [
            "luiz.silva@ccc.ufcg.edu.br",
            "fernan.luizsilva@hotmail.com"
        ], "Lists emails must be equal to")

    def test_replace_value_none(self):
        """Replace attribute without passing the value."""
        self.assertEqual(self.user.name, "Luiz", "Name must be equal to Luiz")
        json = create_json_patch("replace", "/name")
        with self.assertRaises(PatchException) as ex:
            self.json_patch.load(json, self.user)
        self.assertEqual(
            str(ex.exception), "Value can not be None",
            "Expected message to be equal to 'Value can not be None'")
        self.assertEqual(self.user.name, "Luiz", "Name must be equal to Luiz")

    def test_replace_attr_nonexistent(self):
        """Replace attribute nonexitent."""
        self.assertFalse(
            hasattr(self.user, "registration"),
            "Registration attribute must not exist")
        json = create_json_patch("replace", "/registration", "11221212")
        with self.assertRaises(PatchException) as ex:
            self.json_patch.load(json, self.user)
        self.assertEqual(
            str(ex.exception), "Attribute registration not found",
            "Expected message to be equal to 'Attribute registration not found'")

    def test_replace_object_in_list(self):
        """Replace object in list."""
        json = '[{"op": "add", "path": "/parents/-", "value": {"age": 19, "name": "Luiz"}}]'
        self.json_patch.load(json, self.user, define_entity)

        parent = self.user.parents[-1]
        self.assertEqual(
            parent.age,
            19,
            "Age must be equal to 19")
        self.assertEqual(
            parent.name,
            "Luiz",
            "Name must be equal to Luiz")

        json = '[{"op": "replace", "path": "/parents/-/age", "value": 90}]'
        self.json_patch.load(json, self.user)
        self.assertEqual(
            parent.age,
            90,
            "Age must be equal to 90")
        self.assertEqual(
            parent.name,
            "Luiz",
            "Name must be equal to Luiz")

    def test_dict_object_in_list(self):
        """Replace dict in list."""
        json = '[{"op": "add", "path": "/parents/-", "value": {"age": 30, "name": "Test user"}}]'
        self.json_patch.load(json, self.user)

        parent = self.user.parents[-1]
        self.assertEqual(
            parent['age'],
            30,
            "Age must be equal to 30")
        self.assertEqual(
            parent['name'],
            "Test user",
            "Name must be equal to Test user")

        json = '[{"op": "replace", "path": "/parents/-/age", "value": 33}]'
        self.json_patch.load(json, self.user)
        self.assertEqual(
            parent['age'],
            33,
            "Age must be equal to 33")
        self.assertEqual(
            parent['name'],
            "Test user",
            "Name must be equal to Test user")


class TestOperationRemove(TestJsonPatch):
    """Class of test operation remove."""

    def test_rm_simple_value(self):
        """Remove attribute name in user."""
        self.assertTrue(
            hasattr(self.user, 'name'),
            "Name attribute must exist")
        json = create_json_patch("remove", "/name")
        self.json_patch.load(json, self.user)
        self.assertFalse(
            hasattr(self.user, 'name'),
            "Name attribute must not exist")

    def test_rm_object(self):
        """Remove attribute other_user in user."""
        json = '[{"op": "add", "path": "/other_user", "value": {"age": 23, "name": "Mayza"}}]'
        self.json_patch.load(json, self.user, define_entity)

        self.assertTrue(
            hasattr(self.user, 'other_user'),
            "The other_user attribute must exist")
        json = create_json_patch("remove", "/other_user")
        self.json_patch.load(json, self.user, define_entity)
        self.assertFalse(
            hasattr(self.user, 'other_user'),
            "The other_user attribute must not exist")

    def test_rm_in_list(self):
        """Remove email in list emails."""
        self.assertListEqual(self.user.emails, [
            "luiz.silva@ccc.ufcg.edu.br",
            "fernan.luizsilva@gmail.com"
        ], "Lists emails must be equal to")
        json = create_json_patch("remove", "/emails/-")
        self.json_patch.load(json, self.user)
        self.assertListEqual(self.user.emails, [
            "luiz.silva@ccc.ufcg.edu.br"
        ], "Lists emails must be equal to")

    def test_rm_attr_nonexistent(self):
        """Remove attribute nonexistent."""
        self.assertFalse(
            hasattr(self.user, "registration"),
            "The registration attribute must not exist")
        json = create_json_patch("remove", "/registration", "11221212")
        with self.assertRaises(PatchException) as ex:
            self.json_patch.load(json, self.user)
        self.assertEqual(
            str(ex.exception), "Attribute registration not found",
            "Expected message to be equal to 'Attribute registration not found'")

    def test_rm_attr_in_dict(self):
        """Remove attribute in dict."""
        json = '[{"op": "add", "path": "/parents/-", "value": {"age": 25, "name": "Test"}}]'
        self.json_patch.load(json, self.user)

        parent = self.user.parents[-1]
        self.assertEqual(
            parent['age'],
            25,
            "Age must be equal to 25")
        self.assertEqual(
            parent['name'],
            "Test",
            "Name must be equal to Test")

        json = '[{"op": "remove", "path": "/parents/-/age"}]'
        self.json_patch.load(json, self.user)

        self.assertEqual(
            parent['name'],
            "Test",
            "Name must be equal to Test")
        self.assertFalse('age' in parent)


class TestOperationTest(TestJsonPatch):
    """Class of test operation test."""

    def test_simple_value(self):
        """Test if attribute name is Luiz."""
        self.assertEqual(self.user.name, "Luiz", "Name must be equal to Luiz")
        json = create_json_patch("test", "/name", "Luiz")
        self.json_patch.load(json, self.user)
        self.assertEqual(self.user.name, "Luiz", "Name must be equal to Luiz")

    def test_in_list(self):
        """Test if first email is luiz.silva@ccc.ufcg.edu.br."""
        self.assertEqual(
            self.user.emails[0], "luiz.silva@ccc.ufcg.edu.br",
            "Email in list index 0 must be equal luiz.silva@ccc.ufcg.edu.br")
        json = create_json_patch("test", "/emails/0", "luiz.silva@ccc.ufcg.edu.br")
        self.json_patch.load(json, self.user)
        self.assertEqual(
            self.user.emails[0], "luiz.silva@ccc.ufcg.edu.br",
            "Email in list index 0 must be equal luiz.silva@ccc.ufcg.edu.br")

    def test_err_value(self):
        """Test fail for verify if operation test it's correct."""
        self.assertEqual(self.user.name, "Luiz", "Name must be equal to Luiz")
        json = create_json_patch("test", "/name", "Mayza")
        with self.assertRaises(PatchException) as ex:
            self.json_patch.load(json, self.user)
        self.assertEqual(
            str(ex.exception),
            "Test fail, object Luiz does not correspond to what was passed Mayza",
            "Expected message to be equal to 'Test fail, "
            "object Luiz does not correspond to what was passed Mayza'")
        self.assertEqual(self.user.name, "Luiz", "Name must be equal to Luiz")
