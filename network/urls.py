
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path('create_post', views.create_post, name='create_post'),
    path('all_posts', views.all_posts, name='all_posts'),
    path('post/<int:post_id>/like', views.toggle_like, name='toggle_like'),
    path('post/<int:post_id>', views.edit_post, name='edit_post'),
    path('users/<int:user_id>', views.profile_page, name='profile_page'),
    path('users/<int:user_id>/following', views.follow_toggle, name='follow_toggle'),
    path('following_posts', views.following_posts, name='following_posts'),
]
