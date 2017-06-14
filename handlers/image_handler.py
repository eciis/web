# -*- coding: utf-8 -*-
"""Image Handler. """

import json
from handlers.base_handler import BaseHandler

from storage.storage_manager import StorageImage
from utils import login_required
from utils import json_response


class ImageHandler(BaseHandler):
    """Handler of upload image."""

    @login_required
    @json_response
    def get(self, user, image_key):
        """Get image."""
        image_storage = StorageImage()
        image_data = image_storage.get_file(image_key)
        # Write the contents to the response.
        self.response.headers['Content-Type'] = image_data['content_type']
        self.response.write(image_data['blob_data'])

    @login_required
    @json_response
    def post(self, user):
        """Save image in data store."""
        file_uploaded = self.request.POST.get("image", None)
        image_storage = StorageImage()
        blob_key = image_storage.store_image(image=file_uploaded, size=800)
        data = {'file_url': 'http://%s/api/images/%s' % (self.request.host, blob_key)}
        self.response.write(json.dumps(data))
