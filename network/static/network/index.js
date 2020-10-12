document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#all-posts').addEventListener('click', all_posts);
    document.querySelector('#create-post-view').addEventListener('click', create_post);
    

     // By default
    console.log('on load')
     all_posts();
})

function all_posts() {
    console.log('all_post function')
    document.querySelector('#create-post-view').style.display = 'block';
    document.querySelector('#all-posts-view').style.display = 'block';
    let username = document.querySelector('#username').text;
    document.querySelector('#all-posts-view').innerHTML = '';

    fetch('/all_posts')
    .then(response => response.json())
    .then(posts => {
        for (post of posts) {
            let postContainer = document.createElement('div');
            postContainer.className = 'post-container';

            let user = document.createElement('div');
            user.className = 'post-user';
            user.innerHTML = post.user.username;
            user.dataset.id = post.user.id;
            user.addEventListener('click', profile_page);
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
            heart.onclick = like_toggle;
            likesContainer.append(heart);

            let likes = document.createElement('div');
            likes.className = 'post-likes';
            likes.innerHTML = post.likes_count;
            likesContainer.append(likes);

            // <button class="btn btn-primary post-edit"></button>

            document.querySelector('#all-posts-view').append(postContainer)    
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

function create_post() {
    document.querySelector('#error-message').style.display = 'none';

    document.querySelector('.new-post-form').onsubmit = (event) => {
        
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
}

function profile_page() {

}