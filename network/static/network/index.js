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
    document.querySelector('#all-posts').style.display = 'block';

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

            let likes = document.createElement('div');
            likes.className = 'post-likes';
            likes.innerHTML = 'Likes: 0';
            postContainer.append(likes);

            // <button class="btn btn-primary post-edit"></button>

            document.querySelector('#all-posts-view').append(postContainer)    
        }
    })
}

function create_post() {

}

function profile_page() {

}