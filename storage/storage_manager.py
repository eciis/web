# -*- coding: utf-8 -*-
"""Module of storage files in cloud storage."""

import mimetypes
from google.appengine.ext import blobstore
from google.appengine.api import files
from google.appengine.api.files import blobstore as files_blobstore
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
        kwargs = {}
        if content_type:
            kwargs['mime_type'] = content_type
        if file_name:
            kwargs['_blobinfo_uploaded_filename'] = file_name
        output_filename = files.blobstore.create(**kwargs)
        with files.open(output_filename, 'a') as outfile:
            outfile.write(file)
        files.finalize(output_filename)
        blob_key = files_blobstore.get_blob_key(output_filename)

        return blob_key

    def get_file(self, blob_key):
        """Get file of cloud storage."""
        Utils._assert(
            blobstore.get(blob_key) is None,
            "File not found",
            FileStorageException)
        blob_info = blobstore.get(blob_key)
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
            'blob_data': blob_reader_data,
            'filename': blob_info.filename.encode('utf-8')
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

        # resize images images with a width greater than size
        if images.Image(image).width > size:
            image = images.resize(image, size)

        image_type = mimetypes.guess_type(image_name)[0]
        return self.store_file(image, image_name, image_type)
