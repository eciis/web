# -*- coding: utf-8 -*-
# from __future__ import unicode_literals

# import random
# import string

from google.appengine.ext import ndb
from utils import Utils

import json


def add_permission(user, entity_id, permission):
    permission = "%s:%s" % (permission, entity_id)
    user.permissions[permission] = True
    print "[Log]: "+permission+" GRANTED to "+user.id


# class User():

#     def __init__(self, name, id):
#         self.name = name
#         self.id = id
#         self.permissions = {}


# class Post():

#     def __init__(self, owner_id, inst_id):
#         self.owner = owner_id
#         self.institution = inst_id
#         self.id = ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(20))


# class Institution():

#     def __init__(self, admin, id):
#         self.admin = admin.id
#         self.id = id
#         self.posts = []

#         add_permission(admin, self.id, "delete_post")

#     def add_member(self, user):
#         add_permission(user, self.id, "publish_post")
#         print "[Log]: "+user.id+" novo membro de instituição "+self.id

#     @has_permission("publish_post")
#     def publish_post(self, user):
#         post = Post(user.id, self.id)
#         self.posts.append(post)
#         add_permission(user, post.id, "edit_post")
#         add_permission(user, post.id, "delete_post")
#         print "[Log]: Post de "+user.id+" publicado"
#         return post


# @has_permission("edit_post")
# def edit_post(user, post):
#     print "Post editado por "+user.name
       

# @has_permission("delete_post")
# def delete_post(user, post):
#     print "Post removido por "+user.name


# normal_user = User("User Normal", "999")

# admin = User("Administrador", "666")

# inst = Institution(admin, "1")

# inst.add_member(normal_user)

# post = inst.publish_post(normal_user)

# print ">>>>>>>>>>>> Editando post com administrador"
# edit_post(admin, post)

# print ">>>>>>>>>>>> Deletando post com user normal"
# delete_post(normal_user, post)

# print ">>>>>>>>>>>> Deletando post com admin da instituição"
# delete_post(admin, post)