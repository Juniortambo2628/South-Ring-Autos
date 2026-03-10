// Blog List Handler
/* eslint-disable no-console */

const { formatDate: formatDateUtil } = require('./utils/date-formatter');

document.addEventListener('DOMContentLoaded', function() {
    loadBlogPosts();
    
    // Category filter
    document.querySelectorAll('[data-category]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            loadBlogPosts(category);
        });
    });
    
    // Search functionality
    document.getElementById('search-btn')?.addEventListener('click', function() {
        const keyword = document.getElementById('search-input').value;
        loadBlogPosts(null, keyword);
    });
});

function loadBlogPosts(category = null, search = null) {
    fetch('api/blog.php?action=list&category=' + (category || '') + '&search=' + (search || ''))
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderBlogPosts(data.posts || []);
                renderRecentPosts(data.recent || []);
                renderPagination(data.pagination || {});
            } else {
                document.getElementById('blog-list').innerHTML = '<div class="col-12"><p class="text-center">No blog posts found. Check back soon!</p></div>';
            }
        })
        .catch(error => {
            console.error('Error loading blog posts:', error);
            // Fallback: show sample post
            showSamplePosts();
        });
}

function renderBlogPosts(posts) {
    const container = document.getElementById('blog-list');
    if (!posts || posts.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-center">No blog posts found. Check back soon!</p></div>';
        return;
    }
    
    container.innerHTML = posts.map(post => `
        <div class="col-12 wow fadeInUp" data-wow-delay="0.1s">
            <div class="bg-light overflow-hidden">
                <div class="row g-0">
                    <div class="col-12 col-sm-5 h-100">
                        <img class="img-fluid w-100 h-100" src="${post.image || 'img/Garage-Images/Car-GX-1.jpg'}" style="object-fit: cover;" alt="${post.title}">
                    </div>
                    <div class="col-12 col-sm-7 h-100 d-flex flex-column justify-content-center">
                        <div class="p-4">
                            <div class="d-flex mb-3">
                                <small class="me-3"><i class="fa fa-calendar text-primary me-2"></i>${formatDate(post.created_at)}</small>
                                <small class="me-3"><i class="fa fa-folder text-primary me-2"></i>${post.category || 'General'}</small>
                            </div>
                            <h4 class="mb-3">${post.title}</h4>
                            <p class="mb-3">${post.excerpt || post.content.substring(0, 150) + '...'}</p>
                            <a class="btn btn-primary py-2 px-4" href="blog-single.php?id=${post.id}">Read More<i class="fa fa-arrow-right ms-2"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderRecentPosts(posts) {
    const container = document.getElementById('recent-posts');
    if (!posts || posts.length === 0) {
        container.innerHTML = '<p>No recent posts</p>';
        return;
    }
    
    container.innerHTML = posts.slice(0, 5).map(post => `
        <div class="d-flex mb-3">
            <img class="img-fluid" src="${post.image || 'img/Garage-Images/Car-GX-2.jpg'}" style="width: 80px; height: 80px; object-fit: cover;">
            <div class="w-100 d-flex flex-column text-start ms-3">
                <h6 class="mb-0"><a href="blog-single.php?id=${post.id}">${post.title}</a></h6>
                <small>${formatDate(post.created_at)}</small>
            </div>
        </div>
    `).join('');
}

function renderPagination(pagination) {
    const container = document.getElementById('pagination');
    if (!pagination || !pagination.total_pages) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    if (pagination.current_page > 1) {
        html += `<li class="page-item"><a class="page-link" href="#" data-page="${pagination.current_page - 1}">Previous</a></li>`;
    }
    for (let i = 1; i <= pagination.total_pages; i++) {
        html += `<li class="page-item ${i === pagination.current_page ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
    }
    if (pagination.current_page < pagination.total_pages) {
        html += `<li class="page-item"><a class="page-link" href="#" data-page="${pagination.current_page + 1}">Next</a></li>`;
    }
    container.innerHTML = html;
    
    container.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            loadBlogPosts(null, null, this.getAttribute('data-page'));
        });
    });
}

// Use date-fns for consistent date formatting
function formatDate(dateString) {
    return formatDateUtil(dateString, 'MMMM dd, yyyy');
}

function showSamplePosts() {
    const samplePosts = [
        {
            id: 1,
            title: '5 Essential Car Maintenance Tips for Nairobi Drivers',
            excerpt: 'Learn how to keep your vehicle running smoothly in Nairobi\'s traffic conditions with these essential maintenance tips.',
            image: 'img/Garage-Images/Car-GX-1.jpg',
            created_at: new Date().toISOString(),
            category: 'Maintenance'
        },
        {
            id: 2,
            title: 'When to Replace Your Engine Oil',
            excerpt: 'Understanding when and why to change your engine oil can save you money and prevent major engine problems.',
            image: 'img/Garage-Images/Engine-block.jpg',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            category: 'Tips'
        }
    ];
    renderBlogPosts(samplePosts);
    renderRecentPosts(samplePosts);
}

