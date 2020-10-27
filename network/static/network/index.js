document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#all-posts').addEventListener('click', all_posts);
    let create_post_form = document.querySelector('.new-post-form')
    if (create_post_form !== null){
        document.querySelector('.new-post-form').addEventListener('submit', create_post);
        document.querySelector('#username').addEventListener('click', (event) => profile_page(event.target.dataset.id));
        document.querySelector('.follow_button').addEventListener('click', follow_toggle);
        document.querySelector('#following').addEventListener('click', (event) => following_posts());
    }
    
     // By default
     all_posts();
})

function build_post(post, username) {
    let postContainer = document.createElement('div');
    postContainer.className = 'post-container';

    let user = document.createElement('div');
    user.className = 'post-user';
    user.innerHTML = post.user.username;
    user.dataset.id = post.user.id;
    user.addEventListener('click', () => profile_page(post.user.id));
    postContainer.append(user);

    let text = document.createElement('div');
    text.className = 'post-text';
    text.innerHTML = post.text;
    postContainer.append(text);

    let timestamp = document.createElement('div');
    timestamp.className = 'post-created';
    timestamp.innerHTML = post.date_created;
    postContainer.append(timestamp);

    let likesContainer = document.createElement('div');
    likesContainer.className = 'likes-container';
    postContainer.append(likesContainer);

    let heart = document.createElement('i');
    if (post.liked == true){
        heart.className = 'fa fa-heart';
    } else {
        heart.className = 'fa fa-heart-o';
    }
    heart.dataset.id = post.id;
    if (username !== null) {
        heart.onclick = like_toggle;
    } else {
        heart.onclick = () => {
            document.querySelector('#error-message').style.display = 'block';
            document.querySelector('#error-message').innerHTML = 'To be able to like posts you need to sign in';
        }
    }
    likesContainer.append(heart);

    let likes = document.createElement('div');
    likes.className = 'post-likes';
    likes.innerHTML = post.likes_count;
    likesContainer.append(likes);

    if (username == post.user.username) {
        let edit = document.createElement('button');
        edit.className = 'btn btn-primary post-edit';
        edit.dataset.id = post.id;
        edit.innerHTML = 'Edit';
        edit.onclick = edit_post;
        postContainer.append(edit)
    }
    return postContainer;

}


function all_posts(page=1) {
    
    document.querySelector('#error-message').style.display = 'none';
    document.querySelector('#user-page-view').style.display = 'none';
    let createPost = document.querySelector('#create-post-view')
    let username = null;
    if (createPost !== null) {
        document.querySelector('#create-post-view').style.display = 'block';
        document.querySelector('#edit-post-view').style.display = 'none';
        username = document.querySelector('#username').text;
    }
    
    document.querySelector('#all-posts-view').style.display = 'block';
    
    
    document.querySelector('#all-posts-view').innerHTML = '';

    fetch(`/all_posts?page=${page}`)
    .then(response => response.json())
    .then(data => {
        for (post of data.posts) {
            let postContainer = build_post(post, username);
            
            document.querySelector('#all-posts-view').append(postContainer)
        
        }

        if (data.pagination.pages > 1) {
            let paginatorContainer = document.createElement('div');
            paginatorContainer.className = "paginator-container";

            if (data.pagination.current_page > 1) {
                let previousPage = document.createElement('div');
                previousPage.className = 'previos-page';
                previousPage.innerHTML = 'Previous';
                previousPage.onclick = () => {
                    all_posts(data.pagination.current_page - 1)
                } 
                paginatorContainer.append(previousPage);
            }
            if (data.pagination.current_page < data.pagination.pages) {
                let nextPage = document.createElement('div');
                nextPage.className = 'next-page';
                nextPage.innerHTML = 'Next';
                nextPage.onclick = () => {
                    all_posts(data.pagination.current_page + 1)
                }
                paginatorContainer.append(nextPage);
            }
            document.querySelector('#all-posts-view').append(paginatorContainer);
        }
        
    })
}

function like_toggle(event) {
    
    let post_id = event.target.dataset.id
    fetch(`post/${post_id}/like`, {method:'PUT'})
    .then(response => response.json())
    .then(data => {
        let likes_count = data.likes_count;
        if (data.liked === true) {
            event.target.classList.remove('fa-heart-o');
            event.target.classList.add('fa-heart')
            event.target.parentElement.children[1].innerHTML = likes_count;
        } else {
            event.target.classList.remove('fa-heart');
            event.target.classList.add('fa-heart-o');
            event.target.parentElement.children[1].innerHTML = likes_count;
        }

    })
}

function create_post(event) {
    document.querySelector('#error-message').style.display = 'none';

    fetch('/create_post', {
        method: 'POST',
        body: JSON.stringify({text: document.querySelector('#new-post-text').value})
    })
    .then(response => {
        response.json().then(result => {
            if (response.status == 201) {
                document.querySelector('#new-post-text').value = '';
                all_posts();
            } else {
                document.querySelector('#error-message').style.display = 'block';
                document.querySelector('#error-message').innerHTML = result.error;
            }
        })
    })
    .catch(error => {
        console.log('Something went wrong', error)
    })
    event.preventDefault();
}


function edit_post(event) {
    document.querySelector('#error-message').style.display = 'none';
    document.querySelector('#edit-post-view').style.display = 'block';
    document.querySelector('#create-post-view').style.display = 'none';
    document.querySelector('#all-posts-view').style.display = 'none';
    document.querySelector('#user-page-view').style.display = 'none';

    let post_id = event.target.dataset.id;
    
    fetch(`post/${post_id}`)
    .then(response => response.json())
    .then(post => {
        
        document.querySelector('#edit-post-text').value = post.text;
    });

    document.querySelector('.edit-post-form').onsubmit = (event) => {
        fetch(`post/${post_id}`, {
            method: 'PUT',
            body: JSON.stringify({text: document.querySelector('#edit-post-text').value})
        })
        .then(response => {
            response.json().then(result => {
                if (response.status == 201) {
                    document.querySelector('#edit-post-text').value = '';
                    all_posts();
                } else {
                    document.querySelector('#error-message').style.display = 'block';
                    document.querySelector('#error-message').innerHTML = result.error;
                }
            })
        })
    }

}


function profile_page(user_id, page=1) {
    document.querySelector('#error-message').style.display = 'none';
    document.querySelector('#user-page-view').style.display = 'block';
    document.querySelector('#all-posts-view').style.display = 'none';
    document.querySelector('#user-posts-container').innerHTML = '';
    document.querySelector('.follow_button').style.display = 'none';
    let editPost = document.querySelector('#edit-post-view')
    if (editPost !== null) {
        document.querySelector('#edit-post-view').style.display = 'none';
        document.querySelector('#create-post-view').style.display = 'none';
    }
    

    fetch(`users/${user_id}?page=${page}`)
    .then(response => response.json())
    .then(result => {
        document.querySelector('.title').innerHTML = `User: ${result.user.username}`;
        document.querySelector('.user-follows').innerHTML = `Follows: ${result.follows}`;
        document.querySelector('.user-followers').innerHTML = `Followers: ${result.followers}`;
        
        let follower_user_id = document.querySelector('#username')
        if (follower_user_id !== null) {
            follower_user_id = document.querySelector('#username').dataset.id;
        }
        let followee_user_id = user_id;
        if (follower_user_id === followee_user_id || follower_user_id === null) {
            document.querySelector('.follow_button').style.display = 'none';
        } else {
            document.querySelector('.follow_button').style.display = 'block';
            document.querySelector('.follow_button').dataset.id = user_id;
        }


        if (result.followed === true) {
            document.querySelector('.follow_button').innerHTML = 'Unfollow';
        } else {
            document.querySelector('.follow_button').innerHTML = 'Follow';
        }
        

        for (post of result.posts) {
            let postContainer = build_post(post, follower_user_id);
            
            document.querySelector('#user-posts-container').append(postContainer)
        }

        if (result.pagination.pages > 1) {
            let paginatorContainer = document.createElement('div');
            paginatorContainer.className = "paginator-container";
            
            if (result.pagination.current_page > 1) {
                let previousPage = document.createElement('div');
                previousPage.className = 'previos-page';
                previousPage.innerHTML = 'Previous';
                previousPage.onclick = () => {
                    profile_page(user_id, result.pagination.current_page - 1)
                } 
                paginatorContainer.append(previousPage);
            }
            if (result.pagination.current_page < result.pagination.pages) {
                let nextPage = document.createElement('div');
                nextPage.className = 'next-page';
                nextPage.innerHTML = 'Next';
                nextPage.onclick = () => {
                    profile_page(user_id, result.pagination.current_page + 1)
                }
                paginatorContainer.append(nextPage);
            }
            document.querySelector('#user-posts-container').append(paginatorContainer);
        }

    })

}


function follow_toggle(event) {
    document.querySelector('#error-message').style.display = 'none';

    let followee_user_id = event.target.dataset.id;
    let follower_user_id = document.querySelector('#username').dataset.id;

    if (followee_user_id === follower_user_id) {
        document.querySelector('#error-message').style.display = 'block';
        document.querySelector('#error-message').innerHTML = "Users can't follow themselves";
    } else {
        fetch(`users/${followee_user_id}/following`, {
            method: 'PUT'
        })
        .then(response => {
            response.json().then(result => {
                if (response.status === 201) {
                    document.querySelector('.user-follows').innerHTML = `Follows: ${result.follows}`;
                    document.querySelector('.user-followers').innerHTML = `Followers: ${result.followers}`;
                    if (result.followed === true) {
                        document.querySelector('.follow_button').innerHTML = 'Unfollow';
                    } else {
                        document.querySelector('.follow_button').innerHTML = 'Follow';
                    }
                } else {
                    document.querySelector('#error-message').style.display = 'block';
                    document.querySelector('#error-message').innerHTML = result.error;
                }
            })
        })
    }
}

function following_posts(page=1) {
    document.querySelector('#error-message').style.display = 'none';
    document.querySelector('#edit-post-view').style.display = 'none';
    document.querySelector('#create-post-view').style.display = 'none';
    document.querySelector('#all-posts-view').style.display = 'block';
    document.querySelector('#user-page-view').style.display = 'none';
    document.querySelector('#user-posts-container').innerHTML = '';
    document.querySelector('#all-posts-view').innerHTML = '';

    fetch(`/following_posts?page=${page}`)
    .then(response => response.json())
    .then(data => {
        let followingPosts = document.createElement('h5')
        followingPosts.innerHTML = "Following posts"
        document.querySelector('#all-posts-view').append(followingPosts)

        for (post of data.posts) {
            let postContainer = build_post(post);
            
            document.querySelector('#all-posts-view').append(postContainer)
        
        }
        if (data.pagination.pages > 1) {
            let paginatorContainer = document.createElement('div');
            paginatorContainer.className = "paginator-container";

            if (data.pagination.current_page > 1) {
                let previousPage = document.createElement('div');
                previousPage.className = 'previos-page';
                previousPage.innerHTML = 'Previous';
                previousPage.onclick = () => {
                    following_posts(data.pagination.current_page - 1)
                } 
                paginatorContainer.append(previousPage);
            }
            if (data.pagination.current_page < data.pagination.pages) {
                let nextPage = document.createElement('div');
                nextPage.className = 'next-page';
                nextPage.innerHTML = 'Next';
                nextPage.onclick = () => {
                    following_posts(data.pagination.current_page + 1)
                }
                paginatorContainer.append(nextPage);
            }
            document.querySelector('#all-posts-view').append(paginatorContainer);
        }

    })
}