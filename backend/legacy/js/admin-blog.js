/**
 * Admin Blog Management JavaScript
 * Handles blog post CRUD operations with FilePond integration
 */

/* eslint-env browser */
/* global bootstrap, toastr, reloadBlogGrid */
/* eslint-disable no-console */

const FilePond = require('filepond');
const FilePondPluginImagePreview = require('filepond-plugin-image-preview');
const FilePondPluginImageResize = require('filepond-plugin-image-resize');
const FilePondPluginFileValidateType = require('filepond-plugin-file-validate-type');
const FilePondPluginFileValidateSize = require('filepond-plugin-file-validate-size');
const { formatDateTime } = require('./utils/date-formatter');

// Register FilePond plugins
FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileValidateType,
    FilePondPluginFileValidateSize
);

let allPosts = [];
let filePondInstance = null;

function loadPosts() {
    fetch('../api/blog.php?action=list&admin=true')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.posts) {
                allPosts = data.posts;
                // Make allPosts available globally for grid initialization
                window.allPosts = allPosts;
                // Only render to posts-list if it exists (old structure)
                const postsList = document.getElementById('posts-list');
                if (postsList) {
                    renderPosts(data.posts);
                }
                // Grid will be initialized by inline script in blog.php
            } else {
                // Only show empty state if posts-list exists (old structure)
                const postsList = document.getElementById('posts-list');
                if (postsList) {
                    showEmptyState();
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            const container = document.getElementById('posts-list');
            if (container) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h4>Error loading posts</h4>
                        <p>Please refresh the page</p>
                    </div>
                `;
            }
        });
}

function renderPosts(posts) {
    if (posts.length === 0) {
        showEmptyState();
        return;
    }

    const html = posts.map(post => {
        const statusClass = post.status === 'published' ? 'status-confirmed' : 'status-pending';
        
        return `
            <div class="post-item">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <div class="item-title">
                            <i class="fas fa-file-alt me-2"></i>${escapeHtml(post.title)}
                        </div>
                        ${post.excerpt ? `<div class="item-meta">${escapeHtml(post.excerpt)}</div>` : ''}
                        <div class="item-meta">
                            <i class="fas fa-tag me-2"></i><strong>Category:</strong> ${escapeHtml(post.category || 'General')}
                        </div>
                        <div class="item-meta">
                            <i class="fas fa-clock me-2"></i><strong>Created:</strong> ${formatDateTime(post.created_at)}
                        </div>
                    </div>
                    <div class="col-md-4 text-end">
                        <span class="badge badge-pill ${statusClass} mb-3">${post.status}</span>
                        <br>
                        <button class="btn btn-pill btn-primary btn-sm me-2" onclick="editPost(${post.id})">
                            <i class="fas fa-edit me-2"></i>Edit
                        </button>
                        <button class="btn btn-pill btn-outline-light btn-sm" onclick="deletePost(${post.id})">
                            <i class="fas fa-trash me-2"></i>Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    const container = document.getElementById('posts-list');
    if (container) {
        container.innerHTML = html;
    }
}

function showEmptyState() {
    const container = document.getElementById('posts-list');
    if (container) {
        container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <h4>No blog posts found</h4>
            <p>Create your first blog post to get started</p>
        </div>
    `;
    }
}

function openCreateModal() {
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="fas fa-plus me-2"></i>Create New Post';
    }
    document.getElementById('postForm').reset();
    document.getElementById('postId').value = '';
    
    // Clear FilePond
    if (filePondInstance) {
        filePondInstance.removeFiles();
    }
    
    const modal = new bootstrap.Modal(document.getElementById('postModal'));
    modal.show();
}

function editPost(id) {
    const post = allPosts.find(p => p.id == id);
    if (!post) return;

    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="fas fa-edit me-2"></i>Edit Post';
    }
    document.getElementById('postId').value = post.id;
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postExcerpt').value = post.excerpt || '';
    document.getElementById('postContent').value = post.content;
    document.getElementById('postCategory').value = post.category || 'General';
    document.getElementById('postStatus').value = post.status || 'published';
    
    // Set FilePond file if image exists
    if (filePondInstance && post.image) {
        filePondInstance.removeFiles();
        filePondInstance.addFile(post.image, {
            type: 'limbo',
            serverId: post.image
        });
    } else if (filePondInstance) {
        filePondInstance.removeFiles();
    }

    const modal = new bootstrap.Modal(document.getElementById('postModal'));
    modal.show();
}

function deletePost(id) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    fetch(`../api/blog.php?action=delete&id=${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadPosts();
                // Reload grid if reloadBlogGrid function exists
                if (typeof reloadBlogGrid === 'function') {
                    reloadBlogGrid();
                }
            } else {
                alert('Error deleting post: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            if (typeof toastr !== 'undefined') {
                toastr.error('Error deleting post');
            } else {
                alert('Error deleting post');
            }
        });
}

// Initialize FilePond
function initFilePond() {
    const inputElement = document.querySelector('#postImageFilepond');
    if (!inputElement) return;

    filePondInstance = FilePond.create(inputElement, {
        server: {
            url: '../api/',
            process: {
                url: 'upload-blog-image.php',
                method: 'POST',
                headers: {},
                onload: (response) => {
                    try {
                        const data = JSON.parse(response);
                        return data.url || data.path;
                    } catch (e) {
                        return response;
                    }
                },
                onerror: (response) => {
                    try {
                        const error = JSON.parse(response);
                        return error.message || 'Upload failed';
                    } catch (e) {
                        return 'Upload failed';
                    }
                }
            },
            revert: null
        },
        allowImagePreview: true,
        allowImageResize: true,
        imageResizeTargetWidth: 1200,
        imageResizeTargetHeight: 800,
        imageResizeMode: 'contain',
        imageResizeUpscale: false,
        acceptedFileTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        maxFileSize: '5MB',
        labelIdle: 'Drag & Drop your image or <span class="filepond--label-action">Browse</span>',
        labelInvalidField: 'Field contains invalid files',
        labelFileWaitingForSize: 'Waiting for size',
        labelFileSizeNotAvailable: 'Size not available',
        labelFileLoading: 'Loading',
        labelFileLoadError: 'Error during load',
        labelFileProcessing: 'Uploading',
        labelFileProcessingComplete: 'Upload complete',
        labelFileProcessingAborted: 'Upload cancelled',
        labelFileProcessingError: 'Error during upload',
        labelFileProcessingRevertError: 'Error during revert',
        labelFileRemoveError: 'Error during remove',
        labelTapToCancel: 'tap to cancel',
        labelTapToRetry: 'tap to retry',
        labelTapToUndo: 'tap to undo',
        labelButtonRemoveItem: 'Remove',
        labelButtonAbortItemLoad: 'Abort',
        labelButtonRetryItemLoad: 'Retry',
        labelButtonAbortItemProcessing: 'Cancel',
        labelButtonRetryItemProcessing: 'Retry',
        labelButtonProcessItem: 'Upload'
    });
}

document.getElementById('postForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('postId').value;
    const isEdit = id !== '';
    
    // Get image URL from FilePond
    let imageUrl = '';
    if (filePondInstance && filePondInstance.getFiles().length > 0) {
        const file = filePondInstance.getFiles()[0];
        if (file.serverId) {
            imageUrl = file.serverId;
        } else if (file.filename) {
            imageUrl = file.filename;
        }
    }
    
    const data = {
        title: document.getElementById('postTitle').value,
        excerpt: document.getElementById('postExcerpt').value,
        content: document.getElementById('postContent').value,
        category: document.getElementById('postCategory').value,
        status: document.getElementById('postStatus').value,
        image: imageUrl
    };

    const url = isEdit ? '../api/blog.php?action=update' : '../api/blog.php?action=create';
    if (isEdit) {
        data.id = id;
    }

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('postModal'));
            modal.hide();
            loadPosts();
            // Reload grid if reloadBlogGrid function exists
            if (typeof reloadBlogGrid === 'function') {
                reloadBlogGrid();
            }
        } else {
                if (typeof toastr !== 'undefined') {
                    toastr.error('Error saving post: ' + (result.message || 'Unknown error'));
                } else {
                    alert('Error saving post: ' + (result.message || 'Unknown error'));
                }
        }
    })
    .catch(error => {
        console.error('Error:', error);
            if (typeof toastr !== 'undefined') {
                toastr.error('Error saving post');
            } else {
                alert('Error saving post');
            }
    });
});

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initFilePond();
    loadPosts();
});

// Make functions globally available
window.openCreateModal = openCreateModal;
window.editPost = editPost;
window.deletePost = deletePost;

