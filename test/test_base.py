"""Import's modules and some basics settings of the test's classes."""
import unittest
import sys
sys.path.append("../")
sys.path.insert(1, 'google_appengine')
sys.path.insert(1, 'google_appengine/lib/webapp2-2.5.2')
sys.path.insert(1, 'google_appengine/lib/yaml/lib')

from google.appengine.ext import testbed
from google.appengine.ext import ndb
from google.appengine.api import images
import webapp2
import webtest
import os
from google.appengine.datastore import datastore_stub_util


class TestBase(unittest.TestCase):
    """SuperClass of the tests."""

    @classmethod
    def setUpClass(cls):
        """setUpClass."""
        os.environ['REMOTE_USER'] = 'luiz.silva@ccc.ufcg.edu.br'
        os.environ['USER_EMAIL'] = 'luiz.silva@ccc.ufcg.edu.br'
        cls.ndb = ndb
        cls.datastore = datastore_stub_util
        cls.testbed = testbed
        cls.webapp2 = webapp2
        cls.webtest = webtest
        cls.os = os
        cls.unittest = unittest
        cls.images = images

        """Start stub to identity app"""
        testbed_instance = cls.testbed.Testbed()
        testbed_instance.activate()
        testbed_instance.init_app_identity_stub()
        testbed_instance.init_mail_stub()
