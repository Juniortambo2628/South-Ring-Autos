<?php
/**
 * Admin Blog Management
 * Modern glass design interface
 */

require_once __DIR__ . '/includes/auth-check.php';

use SouthRingAutos\Utils\SessionManager;

// Set page variables for header
$pageTitle = 'Manage Blog | South Ring Autos Admin';
$currentPage = 'blog.php';
$additionalCSS = [
    'https://unpkg.com/filepond@^4/dist/filepond.css',
    'https://unpkg.com/filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
];
include __DIR__ . '/includes/header.php';
?>

    <div class="container-fluid mt-4 admin-main-container">
        <div class="row h-100">
            <?php include __DIR__ . '/includes/sidebar.php'; ?>
            <div class="col-md-10 admin-content-area">
                <?php
                // Hero Section
                $heroConfig = [
                    'title' => 'Blog Posts',
                    'subtitle' => 'Create and manage blog posts for your website',
                    'icon' => 'fas fa-blog',
                    'theme' => 'admin',
                    'breadcrumbs' => [
                        ['label' => 'Dashboard', 'url' => 'dashboard.php'],
                        ['label' => 'Blog Posts', 'url' => 'blog.php', 'active' => true]
                    ]
                ];
                include __DIR__ . '/../includes/hero-section.php';
                ?>

                <!-- Search and Filter Container -->
                <div class="content-card mb-4">
                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <div id="search-container"></div>
                            </div>
                            <div class="col-md-6">
                                <div id="filter-container"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Grid Container -->
                <div class="content-card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="mb-0 text-white"><i class="fas fa-list me-2"></i>Blog Posts</h5>
                            <button class="btn btn-primary btn-sm" onclick="openCreateModal()">
                                <i class="fas fa-plus me-1"></i>New Post
                            </button>
                        </div>
                        <div id="grid-container"></div>
                        <div id="pagination-container" class="mt-4"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Create/Edit Post Modal -->
    <div class="modal fade" id="postModal" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content glass-card">
                <div class="modal-header border-0">
                    <h5 class="modal-title text-white" id="modalTitle"><i class="fas fa-edit me-2"></i>Create New Post</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="postForm">
                        <input type="hidden" id="postId" name="id">
                        <div class="mb-3">
                            <label class="form-label-glass">Title</label>
                            <input type="text" class="form-control form-control-glass" id="postTitle" name="title" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label-glass">Excerpt</label>
                            <textarea class="form-control form-control-glass" id="postExcerpt" name="excerpt" rows="2"></textarea>
                        </div>
                        <div class="mb-3">
                            <label class="form-label-glass">Content</label>
                            <textarea class="form-control form-control-glass" id="postContent" name="content" rows="8" required></textarea>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label-glass">Category</label>
                                <select class="form-select form-control-glass" id="postCategory" name="category">
                                    <option value="General">General</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Repairs">Repairs</option>
                                    <option value="Tips">Tips</option>
                                    <option value="News">News</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label-glass">Status</label>
                                <select class="form-select form-control-glass" id="postStatus" name="status">
                                    <option value="published">Published</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label-glass">Featured Image (optional)</label>
                            <input type="file" class="filepond" id="postImageFilepond" name="image" accept="image/*">
                            <input type="hidden" id="postImage" name="image_url">
                        </div>
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-pill btn-primary">
                                <i class="fas fa-save me-2"></i>Save Post
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../js/dist/admin-blog.bundle.js"></script>
    <script src="../js/dist/dashboard-components.bundle.js"></script>
    <script>
        let gridInstance = null;

        // Custom grid renderer for blog posts with thumbnails
        window.renderBlogGrid = function(posts) {
            const container = document.getElementById('grid-container');
            if (!container) return;

            if (posts.length === 0) {
                container.innerHTML = '<div class="text-center py-5"><p class="text-muted">No blog posts found</p></div>';
                return;
            }

            // Apply search and filter if gridInstance exists
            let filtered = posts;
            if (gridInstance && gridInstance.filteredData && gridInstance.filteredData.length > 0) {
                const filteredIds = new Set(gridInstance.filteredData.map(p => p.id));
                filtered = posts.filter(p => filteredIds.has(p.id));
            }

            // Apply pagination
            const startIndex = gridInstance && gridInstance.currentPage ? (gridInstance.currentPage - 1) * gridInstance.config.pageSize : 0;
            const endIndex = startIndex + (gridInstance && gridInstance.config ? gridInstance.config.pageSize : 10);
            const pageData = filtered.slice(startIndex, endIndex);

            container.innerHTML = `
                <div class="row g-3">
                    ${pageData.map(post => {
                        const date = post.created_at ? new Date(post.created_at).toLocaleDateString() : 'N/A';
                        const statusClass = post.status === 'published' ? 'status-confirmed' : 'status-pending';
                        // Get image URL - use post image if available, otherwise company logo
                        const imageUrl = post.image 
                            ? (post.image.startsWith('http') ? post.image : `../${post.image}`)
                            : '../South-ring-logos/SR-Logo-red-White-BG.png';
                        
                        return `
                            <div class="col-6 col-md-4 col-lg-3">
                                <div class="card blog-grid-card h-100" data-post-id="${post.id}">
                                    <div class="blog-thumbnail-container">
                                        <img src="${escapeHtml(imageUrl)}" 
                                             alt="${escapeHtml(post.title)}" 
                                             class="blog-thumbnail"
                                             loading="lazy"
                                             onerror="this.src='../South-ring-logos/SR-Logo-red-White-BG.png'">
                                    </div>
                                    <div class="card-body p-3">
                                        <h6 class="mb-2" style="color: var(--admin-text-primary); font-size: 0.9rem; line-height: 1.3;">
                                            ${escapeHtml(post.title || 'Untitled')}
                                        </h6>
                                        <p class="small mb-2 text-muted" style="font-size: 0.75rem;">
                                            ${escapeHtml(post.excerpt || post.content?.substring(0, 60) || '')}${post.content && post.content.length > 60 ? '...' : ''}
                                        </p>
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <span class="badge badge-pill ${statusClass}" style="font-size: 0.7rem;">
                                                ${escapeHtml(post.status || 'draft')}
                                            </span>
                                            <span class="small text-muted" style="font-size: 0.7rem;">
                                                ${escapeHtml(post.category || 'General')}
                                            </span>
                                        </div>
                                        <p class="small mb-2 text-muted" style="font-size: 0.7rem;">
                                            <i class="fas fa-calendar me-1"></i>${date}
                                        </p>
                                        <div class="mt-2">
                                            <button class="btn btn-sm btn-outline-primary me-1" onclick="if(typeof editPost === 'function') { editPost(${post.id}); }" title="Edit">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-outline-danger" onclick="if(typeof deletePost === 'function') { deletePost(${post.id}); }" title="Delete">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;

            // Render pagination if needed
            if (gridInstance && gridInstance.config.pagination) {
                gridInstance.renderPagination();
            }
        };

        window.escapeHtml = function(text) {
            if (!text) return '';
            const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
            return text.toString().replace(/[&<>"']/g, m => map[m]);
        };

        // Load blog posts grid
        window.loadBlogGrid = function() {
            fetch('../api/blog.php?action=list&admin=true')
                .then(r => r.json())
                .then(data => {
                    console.log('Blog API response:', data); // Debug log
                    if (data.success && data.posts) {
                        const posts = Array.isArray(data.posts) ? data.posts : [];
                        // Update allPosts for admin-blog.js functions
                        if (typeof window.allPosts !== 'undefined') {
                            window.allPosts = posts;
                        }
                        if (gridInstance) {
                            gridInstance.data = posts;
                            gridInstance.filteredData = [...posts];
                        }
                        if (typeof window.renderBlogGrid === 'function') {
                            window.renderBlogGrid(posts);
                        } else {
                            console.error('renderBlogGrid function not available');
                        }
                    } else {
                        console.error('API returned no posts:', data);
                        const container = document.getElementById('grid-container');
                        if (container) {
                            container.innerHTML = '<div class="text-center py-5"><p class="text-muted">No blog posts found</p></div>';
                        }
                    }
                })
                .catch(err => {
                    console.error('Error loading posts:', err);
                    const container = document.getElementById('grid-container');
                    if (container) {
                        container.innerHTML = '<div class="text-center py-5"><p class="text-danger">Error loading posts. Please refresh the page.</p></div>';
                    }
                });
        };

        // Initialize Grid for blog posts
        document.addEventListener('DOMContentLoaded', function() {
            // Wait a bit to ensure all functions are defined
            setTimeout(() => {
                // Load posts first
                if (typeof window.loadBlogGrid === 'function') {
                    window.loadBlogGrid();
                }
                
                // Initialize search and filter (without GridJS rendering)
                if (typeof DashboardGrid !== 'undefined') {
                    gridInstance = new DashboardGrid({
                        containerId: 'grid-container',
                        searchContainerId: 'search-container',
                        filterContainerId: 'filter-container',
                        paginationContainerId: 'pagination-container',
                        apiUrl: '../api/blog.php?action=list&admin=true',
                        columns: [],
                        searchable: true,
                        searchKeys: ['title', 'excerpt', 'category', 'status', 'content'],
                        filterable: true,
                        filters: [
                            {
                                key: 'status',
                                label: 'Status',
                                options: [
                                    { value: 'published', label: 'Published' },
                                    { value: 'draft', label: 'Draft' }
                                ]
                            },
                            {
                                key: 'category',
                                label: 'Category',
                                options: [
                                    { value: 'General', label: 'General' },
                                    { value: 'Maintenance', label: 'Maintenance' },
                                    { value: 'Repairs', label: 'Repairs' },
                                    { value: 'Tips', label: 'Tips' },
                                    { value: 'News', label: 'News' }
                                ]
                            }
                        ],
                        pagination: true,
                        pageSize: 10
                    });

                    // Prevent GridJS from rendering - we'll use custom grid
                    gridInstance.setupGrid = function() {
                        return;
                    };

                    // Override render to use custom grid
                    gridInstance.render = function() {
                        if (this.data && this.data.length > 0 && typeof window.renderBlogGrid === 'function') {
                            window.renderBlogGrid(this.data);
                        }
                    };

                    // Load data and render
                    gridInstance.loadData().then(() => {
                        if (gridInstance.data && gridInstance.data.length > 0 && typeof window.renderBlogGrid === 'function') {
                            window.renderBlogGrid(gridInstance.data);
                        }
                    });
                }
            }, 200);
        });

        // Function to reload grid after create/update/delete
        window.reloadBlogGrid = function() {
            fetch('../api/blog.php?action=list&admin=true')
                .then(r => r.json())
                .then(data => {
                    if (data.success && data.posts) {
                        const posts = Array.isArray(data.posts) ? data.posts : [];
                        // Update allPosts for admin-blog.js functions
                        if (typeof window.allPosts !== 'undefined') {
                            window.allPosts = posts;
                        }
                        if (gridInstance) {
                            gridInstance.data = posts;
                            gridInstance.filteredData = [...posts];
                        }
                        if (typeof window.renderBlogGrid === 'function') {
                            window.renderBlogGrid(posts);
                        } else if (typeof window.loadBlogGrid === 'function') {
                            window.loadBlogGrid();
                        }
                    }
                })
                .catch(err => {
                    console.error('Error reloading posts:', err);
                });
        };
    </script>
</body>
</html>

