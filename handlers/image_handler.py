# -*- coding: utf-8 -*-
"""Image Handler. """

from handlers.base_handler import BaseHandler

from storage.storage_manager import StorageImage
from utils import login_required
from utils import json_response


class ImageUploadHandler(BaseHandler):
    """Handler of upload image."""

    @login_required
    @json_response
    def post(self, user):
        """Save image in data store."""
        file_uploaded = self.request.POST.get("image", None)
        image_storage = StorageImage()
        blob_key = image_storage.storage_image(image=file_uploaded, size=200)
        self.redirect('/api/view_image/%s' % blob_key)


class ViewImageHandler(BaseHandler):
    """Handler of view images."""

    def get(self, image_key):
        """Get image."""
        image_storage = StorageImage()
        image_data = image_storage.get_file(image_key)
        # Write the contents to the response.
        self.response.headers['Content-Type'] = image_data['content_type']
        self.response.write(image_data['blob_data'])
