# -*- coding: utf-8 -*-
"""Module of storage files in cloud storage."""

import cloudstorage
import mimetypes
from google.appengine.api import app_identity
from google.appengine.ext import blobstore
from google.appengine.api import images
from utils import Utils


class FileStorageException(Exception):
    """Class exceptions in storage file."""

    def __init__(self, msg=None):
        """Constructor of class FileStorageException."""
        super(FileStorageException, self).__init__(msg or "File storage exception")


class StorageFile(object):
    """Class of storage file in cloud storage."""

    def store_file(self, file, file_name, content_type):
        """Method of storage file."""
        # Get the default Cloud Storage Bucket name and create a file name for
        # the object in Cloud Storage.
        bucket = app_identity.get_default_gcs_bucket_name()

        # Cloud Storage file names are in the format /bucket/object.
        filename = '/{}/{}'.format(bucket, file_name)

        # Create a file in Google Cloud Storage and write something to it.
        with cloudstorage.open(
            filename,
            'w',
            content_type=content_type
        ) as filehandle:
            filehandle.write(file)

        # In order to read the contents of the file using the Blobstore API,
        # you must create a blob_key from the Cloud Storage file name.
        # Blobstore expects the filename to be in the format of:
        # /gs/bucket/object
        blobstore_filename = '/gs{}'.format(filename)
        blob_key = blobstore.create_gs_key(blobstore_filename)
        return blob_key

    def get_file(self, blob_key):
        """Get file of cloud storage."""
        Utils._assert(
            blobstore.get(blob_key) is None,
            "File not found",
            FileStorageException)
        blob_info = blobstore.get(blob_key)
        blob_key = blob_key
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
        return {
            'content_type': blob_info.content_type.encode('utf-8'),
            'blob_data': blob_reader_data
        }


class StorageImage(StorageFile):
    """Storage image in cloud storage."""

    def store_image(self, image, size):
        """Method of storage image."""
        image_name = image.filename
        image = image.file.read()

        Utils._assert(
            not image_name.endswith(".jpg") and not image_name.endswith(".png"),
            "Image type should be jpg or png", FileStorageException)

        image = images.resize(image, size)
        image_type = mimetypes.guess_type(image_name)[0]

        return self.store_file(image, image_name, image_type)
