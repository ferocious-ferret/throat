""" Basic unit tests """
import os
import unittest
import tempfile
from app import app, db


class FlaskrTestCase(unittest.TestCase):
    """ Here we test for pages loading, etc """
    def setUp(self):
        self.db_fd, app.config['DATABASE'] = tempfile.mkstemp()
        app.config['TESTING'] = True
        self.app = app.test_client()
        with app.app_context():
            db.create_all()

    def tearDown(self):
        os.close(self.db_fd)
        os.unlink(app.config['DATABASE'])

    def test_working_setup(self):
        """ Tests if the index loads """
        x = self.app.get('/')
        assert x.status_code == 200

if __name__ == '__main__':
    unittest.main()
