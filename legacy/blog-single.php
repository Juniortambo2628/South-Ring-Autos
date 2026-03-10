<?php include 'includes/header.php'; ?>

    <!-- Page Header Start -->
    <div class="container-fluid page-header mb-5 p-0" style="background-image: url(img/Garage-Images/Car-GX-1.jpg);">
        <div class="container-fluid page-header-inner py-5">
            <div class="container text-center">
                <h1 class="display-3 text-white mb-3 animated slideInDown" id="post-title-header">Blog Post</h1>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb justify-content-center text-uppercase">
                        <li class="breadcrumb-item"><a href="index.php">Home</a></li>
                        <li class="breadcrumb-item"><a href="blog.php">Blog</a></li>
                        <li class="breadcrumb-item text-white active" aria-current="page">Post</li>
                    </ol>
                </nav>
            </div>
        </div>
    </div>
    <!-- Page Header End -->


    <!-- Blog Detail Start -->
    <div class="container-xxl py-5">
        <div class="container">
            <div class="row g-5">
                <div class="col-lg-8">
                    <div class="mb-5">
                        <img class="img-fluid w-100 mb-4" id="post-image" src="img/Garage-Images/Car-GX-1.jpg" alt="Blog Post">
                        <div class="d-flex mb-3">
                            <small class="me-3"><i class="fa fa-calendar text-primary me-2"></i><span id="post-date"></span></small>
                            <small class="me-3"><i class="fa fa-folder text-primary me-2"></i><span id="post-category"></span></small>
                        </div>
                        <h1 class="mb-4" id="post-title"></h1>
                        <div id="post-content" class="mb-4"></div>
                    </div>
                    <div class="text-center">
                        <a href="blog.php" class="btn btn-primary py-3 px-5">Back to Blog<i class="fa fa-arrow-left ms-2"></i></a>
                    </div>
                </div>

                <div class="col-lg-4">
                    <!-- Recent Posts Sidebar -->
                    <div class="mb-5">
                        <h4 class="text-primary mb-4">Recent Posts</h4>
                        <div id="recent-posts-sidebar">
                            <!-- Loaded via JS -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Blog Detail End -->


<?php include 'includes/footer.php'; ?>

    <!-- Template Javascript -->
    <script src="js/main.js"></script>
    <script>
        // Load single blog post
        document.addEventListener('DOMContentLoaded', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const postId = urlParams.get('id');
            
            if (postId) {
                fetch('api/blog.php?action=single&id=' + postId)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success && data.post) {
                            const post = data.post;
                            document.getElementById('post-title').textContent = post.title;
                            document.getElementById('post-title-header').textContent = post.title;
                            document.getElementById('post-content').innerHTML = post.content.replace(/\n/g, '<br>');
                            if (post.image) {
                                document.getElementById('post-image').src = post.image;
                            }
                            document.getElementById('post-date').textContent = new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                            document.getElementById('post-category').textContent = post.category || 'General';
                            document.title = post.title + ' | South Ring Autos';
                        } else {
                            showSamplePost();
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showSamplePost();
                    });
            } else {
                showSamplePost();
            }
            
            // Load recent posts
            fetch('api/blog.php?action=recent')
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.posts) {
                        const container = document.getElementById('recent-posts-sidebar');
                        container.innerHTML = data.posts.map(post => `
                            <div class="d-flex mb-3">
                                <img class="img-fluid" src="${post.image || 'img/Garage-Images/Car-GX-2.jpg'}" style="width: 80px; height: 80px; object-fit: cover;">
                                <div class="w-100 d-flex flex-column text-start ms-3">
                                    <h6 class="mb-0"><a href="blog-single.php?id=${post.id}">${post.title}</a></h6>
                                    <small>${new Date(post.created_at).toLocaleDateString()}</small>
                                </div>
                            </div>
                        `).join('');
                    }
                })
                .catch(error => console.error('Error loading recent posts:', error));
        });
        
        function showSamplePost() {
            document.getElementById('post-title').textContent = 'Sample Blog Post';
            document.getElementById('post-content').innerHTML = '<p>This is a sample blog post. Connect to the API to see real posts.</p>';
        }
    </script>
</body>

</html>

