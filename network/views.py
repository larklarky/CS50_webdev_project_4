import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
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



def all_posts(request):
    current_user = request.user;
    posts = Post.objects.order_by('-date_created').all()
    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    return JsonResponse({
        "posts": [post.serialize(current_user) for post in page_obj],
        "pagination": {
            "current_page": page_obj.number,
            "pages": page_obj.paginator.num_pages,
        }
    }, safe=False)



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



@csrf_exempt
@login_required
def edit_post(request, post_id):

    user = request.user
    post_id = post_id

    post = Post.objects.filter(id=post_id, user=user).first()
    
    if post:
        if request.method == "GET":
            return JsonResponse(post.serialize(user))

        elif request.method == "PUT":
            data = json.loads(request.body)
            text = data.get('text', '')
            post.text = text
            post.save()
            return JsonResponse(post.serialize(user), status=201)
        else:
            return JsonResponse({"error": "Only posts' owners can edit their posts."}, status=400) 



def profile_page(request, user_id):
    user = User.objects.filter(id=user_id).first()
    current_user = request.user
    
    if not user:
        return JsonResponse({"error": "User doesn't exist"}, status=404)
    else:
        followers = Following.objects.filter(followee=user).count()
        follows = Following.objects.filter(follower=user).count()
        posts = Post.objects.filter(user=user).order_by('-date_created')
        paginator = Paginator(posts, 10)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        if current_user.is_anonymous == False:
            following = Following.objects.filter(followee=user, follower=current_user).first()
            if not following:
                followed = False
            else:
                followed = True
        else: 
            followed = False

        return JsonResponse({
            "user": user.serialize(),
            "followers": followers,
            "follows": follows,
            "followed": followed,
            "posts": [post.serialize(user) for post in page_obj],
            "pagination": {
                "current_page": page_obj.number,
                "pages": page_obj.paginator.num_pages,
            }
        }, status=201)


@csrf_exempt
@login_required
def follow_toggle(request, user_id):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)

    follower_user = request.user
    followee_user = User.objects.filter(id=user_id).first()
    
    if follower_user == followee_user:
        return JsonResponse({"error": "Users can't follow themselves"}, status=400)
    
    following = Following.objects.filter(followee=followee_user, follower=follower_user).first()
    if not following:
        new_following = Following(followee=followee_user, follower=follower_user)
        new_following.save()
        followed = True
    else:
        following.delete()
        followed = False
    
    followers = Following.objects.filter(followee=followee_user).count()
    follows = Following.objects.filter(follower=followee_user).count()


    return JsonResponse({"followed": followed, "followers": followers, "follows": follows}, status=201)



@csrf_exempt
@login_required
def following_posts(request):
    user = request.user
    followed = user.followers.all()
    users_list = []

    for followed_object in followed:
        users_list.append(followed_object.followee_id)
    
    following_posts = Post.objects.filter(user_id__in = users_list).order_by('-date_created')
    paginator = Paginator(following_posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    return JsonResponse({
        "posts": [post.serialize(user) for post in page_obj],
        "pagination": {
            "current_page": page_obj.number,
            "pages": page_obj.paginator.num_pages,
        }
    }, status=201)
    


    

    
