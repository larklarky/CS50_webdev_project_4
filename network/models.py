from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.deletion import CASCADE


class User(AbstractUser):
    pass

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
        }

class Post(models.Model):
    text = models.CharField(max_length = 1000, blank = False)
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='posts')
    date_created = models.DateTimeField(auto_now_add = True)
    date_modified = models.DateTimeField(auto_now = True)

    def serialize(self, current_user):
        like = self.likes.filter(user=current_user).first()
        if like:
            liked = True;
        else:
            liked = False;
        return {
            "id": self.id,
            "text": self.text,
            "user": self.user.serialize(),
            "date_created": self.date_created.strftime("%b %-d %Y, %-I:%M %p"),
            "date_modified": self.date_modified.strftime("%b %-d %Y, %-I:%M %p"),
            "likes_count": self.likes.count(),
            "liked": liked,
        }
    
class Like(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey('Post', on_delete=models.CASCADE, related_name='likes')

class Following(models.Model):
    followee = models.ForeignKey('User', on_delete=models.CASCADE, related_name='followee')
    follower = models.ForeignKey('User', on_delete=models.CASCADE, related_name='followers')




