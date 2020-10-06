from django.contrib import admin

# Register your models here.
from network.models import User, Post, Like, Following

class PostAdmin(admin.ModelAdmin):
    list_display = ('user', 'id', 'date_created', 'date_modified')

class LikeAdmin(admin.ModelAdmin):
    list_display = ('post', 'user')

class FollowingAdmin(admin.ModelAdmin):
    list_display = ('followee', 'follower')


admin.site.register(User)
admin.site.register(Post, PostAdmin)
admin.site.register(Like, LikeAdmin)
admin.site.register(Following, FollowingAdmin)
