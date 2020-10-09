import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.http import request
from django.shortcuts import render
from django.urls import reverse

from .models import User, Post, Like, Following


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@csrf_exempt
@login_required
def create_post(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    data = json.loads(request.body)
    text = data.get('text', '')

    post = Post(text = text, user = request.user)
    post.save()
    return JsonResponse({"message": "Post created successfully."}, status=201)


@login_required
def all_posts(request):
    current_user = request.user;
    posts = Post.objects.order_by('-date_created').all()
    return JsonResponse([post.serialize(current_user) for post in posts], safe=False)


@csrf_exempt
@login_required
def toggle_like(request, post_id):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)
    user = request.user;
    post_id = post_id;
    like = Like.objects.filter(post_id=post_id, user=user).first()
    if not like:
        new_like = Like(post_id=post_id, user=user)
        new_like.save()
        liked = True
    else:
        like.delete()
        liked = False
    
    likes_count = Like.objects.filter(post_id=post_id).count()
    return JsonResponse({"liked": liked, "likes_count": likes_count})
        
    
