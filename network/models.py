from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.deletion import CASCADE


class User(AbstractUser):
    pass

class Post(models.Model):
    text = models.CharField(max_length = 1000, blank = False)
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='posts')
    date_created = models.DateTimeField(auto_now_add = True)
    date_modified = models.DateTimeField(auto_now = True)
    
class Like(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey('Post', on_delete=models.CASCADE, related_name='likes')

class Following(models.Model):
    followee = models.ForeignKey('User', on_delete=models.CASCADE, related_name='followee')
    follower = models.ForeignKey('User', on_delete=models.CASCADE, related_name='followers')




