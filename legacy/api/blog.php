<?php
/**
 * Blog API
 * Refactored to use new architecture
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../bootstrap.php';

use SouthRingAutos\Database\Database;
use SouthRingAutos\Utils\Validator;

$action = $_GET['action'] ?? 'list';

try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();
    
    switch ($action) {
        case 'list':
            listPosts($pdo);
            break;
        case 'single':
            getSinglePost($pdo);
            break;
        case 'recent':
            getRecentPosts($pdo);
            break;
        case 'create':
            createPost($pdo);
            break;
        case 'update':
            updatePost($pdo);
            break;
        case 'delete':
            deletePost($pdo);
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => DEBUG_MODE ? $e->getMessage() : 'An error occurred'
    ]);
}

function listPosts($pdo) {
    $category = $_GET['category'] ?? null;
    $search = $_GET['search'] ?? null;
    $page = intval($_GET['page'] ?? 1);
    $limit = POSTS_PER_PAGE;
    $offset = ($page - 1) * $limit;
    
    // For admin views, allow viewing all posts
    $adminView = isset($_GET['admin']) && $_GET['admin'] === 'true';
    $sql = $adminView ? "SELECT * FROM blog_posts" : "SELECT * FROM blog_posts WHERE status = 'published'";
    $params = [];
    
    if ($category && $category !== 'all') {
        $sql .= " AND category = ?";
        $params[] = $category;
    }
    
    if ($search) {
        $sql .= " AND (title LIKE ? OR content LIKE ?)";
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }
    
    $sql .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get total count for pagination
    $countSql = $adminView ? "SELECT COUNT(*) FROM blog_posts" : "SELECT COUNT(*) FROM blog_posts WHERE status = 'published'";
    $countParams = [];
    if ($category && $category !== 'all') {
        $countSql .= " AND category = ?";
        $countParams[] = $category;
    }
    if ($search) {
        $countSql .= " AND (title LIKE ? OR content LIKE ?)";
        $searchTerm = "%$search%";
        $countParams[] = $searchTerm;
        $countParams[] = $searchTerm;
    }
    
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($countParams);
    $total = $countStmt->fetchColumn();
    $totalPages = ceil($total / $limit);
    
    // Get recent posts
    $recentStmt = $pdo->prepare("SELECT * FROM blog_posts WHERE status = 'published' ORDER BY created_at DESC LIMIT 5");
    $recentStmt->execute();
    $recent = $recentStmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'posts' => $posts,
        'recent' => $recent,
        'pagination' => [
            'current_page' => $page,
            'total_pages' => $totalPages,
            'total_posts' => $total
        ]
    ]);
}

function getSinglePost($pdo) {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'Post ID required']);
        return;
    }
    
    $stmt = $pdo->prepare("SELECT * FROM blog_posts WHERE id = ? AND status = 'published'");
    $stmt->execute([$id]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($post) {
        echo json_encode(['success' => true, 'post' => $post]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Post not found']);
    }
}

function getRecentPosts($pdo) {
    $stmt = $pdo->prepare("SELECT * FROM blog_posts WHERE status = 'published' ORDER BY created_at DESC LIMIT 5");
    $stmt->execute();
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'posts' => $posts]);
}

function createPost($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['success' => false, 'message' => 'POST method required']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate
    $validation = Validator::validateBlogPost($data);
    if (!$validation['valid']) {
        http_response_code(400);
        echo json_encode(['success' => false, 'errors' => $validation['errors']]);
        return;
    }
    
    $sql = "INSERT INTO blog_posts (title, content, excerpt, category, image, status) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $data['title'],
        $data['content'],
        $data['excerpt'] ?? substr($data['content'], 0, 150),
        $data['category'] ?? 'General',
        $data['image'] ?? null,
        $data['status'] ?? 'published'
    ]);
    
    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
}

function updatePost($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['success' => false, 'message' => 'POST method required']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate
    $validation = Validator::validateBlogPost($data);
    if (!$validation['valid']) {
        http_response_code(400);
        echo json_encode(['success' => false, 'errors' => $validation['errors']]);
        return;
    }
    
    $sql = "UPDATE blog_posts SET title = ?, content = ?, excerpt = ?, category = ?, image = ?, status = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $data['title'],
        $data['content'],
        $data['excerpt'] ?? substr($data['content'], 0, 150),
        $data['category'] ?? 'General',
        $data['image'] ?? null,
        $data['status'] ?? 'published',
        $data['id']
    ]);
    
    echo json_encode(['success' => true]);
}

function deletePost($pdo) {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'Post ID required']);
        return;
    }
    
    $stmt = $pdo->prepare("DELETE FROM blog_posts WHERE id = ?");
    $stmt->execute([$id]);
    
    echo json_encode(['success' => true]);
}
