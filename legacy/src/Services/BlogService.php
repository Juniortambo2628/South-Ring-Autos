<?php
/**
 * Blog Service
 * Centralized service for blog operations
 */

namespace SouthRingAutos\Services;

use SouthRingAutos\Database\Database;
use PDO;

class BlogService
{
    private $pdo;

    public function __construct()
    {
        $db = Database::getInstance();
        $this->pdo = $db->getConnection();
    }

    /**
     * Get all blog posts
     */
    public function getAllPosts($limit = null, $offset = 0)
    {
        $sql = "SELECT * FROM blog_posts ORDER BY created_at DESC";
        
        if ($limit) {
            $sql .= " LIMIT :limit OFFSET :offset";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        } else {
            $stmt = $this->pdo->prepare($sql);
        }
        
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get post by ID
     */
    public function getPostById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM blog_posts WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Create new post
     */
    public function createPost($data)
    {
        $sql = "INSERT INTO blog_posts (title, slug, content, excerpt, featured_image, status, author_id, created_at, updated_at) 
                VALUES (:title, :slug, :content, :excerpt, :featured_image, :status, :author_id, NOW(), NOW())";
        
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([
            ':title' => $data['title'],
            ':slug' => $data['slug'],
            ':content' => $data['content'],
            ':excerpt' => $data['excerpt'] ?? '',
            ':featured_image' => $data['featured_image'] ?? null,
            ':status' => $data['status'] ?? 'draft',
            ':author_id' => $data['author_id'] ?? 1
        ]);
    }

    /**
     * Update post
     */
    public function updatePost($id, $data)
    {
        $sql = "UPDATE blog_posts SET 
                title = :title, slug = :slug, content = :content, excerpt = :excerpt, 
                featured_image = :featured_image, status = :status, updated_at = NOW() 
                WHERE id = :id";
        
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([
            ':title' => $data['title'],
            ':slug' => $data['slug'],
            ':content' => $data['content'],
            ':excerpt' => $data['excerpt'] ?? '',
            ':featured_image' => $data['featured_image'] ?? null,
            ':status' => $data['status'] ?? 'draft',
            ':id' => $id
        ]);
    }

    /**
     * Delete post
     */
    public function deletePost($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM blog_posts WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }
}

