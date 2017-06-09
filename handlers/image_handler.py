# -*- coding: utf-8 -*-
"""Image Handler. """

import cloudstorage
from google.appengine.api import app_identity
from google.appengine.ext import blobstore
from handlers.base_handler import BaseHandler

from utils import login_required
from utils import json_response


class ImageUploadHandler(BaseHandler):
    """Handler of upload image."""

    @login_required
    @json_response
    def post(self, user):
        """Save image in data store."""
        file_upload = self.request.POST.get("file", None)
        file_name = file_upload.filename
        file = file_upload.file.read()

        # Get the default Cloud Storage Bucket name and create a file name for
        # the object in Cloud Storage.
        bucket = app_identity.get_default_gcs_bucket_name()

        # Cloud Storage file names are in the format /bucket/object.
        filename = '/{}/{}'.format(bucket, file_name)

        # Create a file in Google Cloud Storage and write something to it.
        with cloudstorage.open(filename, 'w') as filehandle:
            filehandle.write(file)

        # In order to read the contents of the file using the Blobstore API,
        # you must create a blob_key from the Cloud Storage file name.
        # Blobstore expects the filename to be in the format of:
        # /gs/bucket/object
        blobstore_filename = '/gs{}'.format(filename)
        blob_key = blobstore.create_gs_key(blobstore_filename)
        self.redirect('/api/view_image/%s' % blob_key)


class ViewImageHandler(BaseHandler):
    """Handler of view images."""

    def get(self, image_key):
        """Get image."""
        if blobstore.get(image_key):
            blob_key = image_key
            # Instantiate a BlobReader for a given Blobstore blob_key.
            blob_reader = blobstore.BlobReader(blob_key)

            # Instantiate a BlobReader for a given Blobstore blob_key, setting the
            # buffer size to 1 MB.
            blob_reader = blobstore.BlobReader(blob_key, buffer_size=1048576)

            # Instantiate a BlobReader for a given Blobstore blob_key, setting the
            # initial read position.
            blob_reader = blobstore.BlobReader(blob_key, position=0)

            # Read the entire value into memory. This may take a while depending
            # on the size of the value and the size of the read buffer, and is not
            # recommended for large values.
            blob_reader_data = blob_reader.read()

            # Write the contents to the response.
            self.response.headers['Content-Type'] = 'image/jpg'
            self.response.write(blob_reader_data)
        else:
            self.response.status(404)
