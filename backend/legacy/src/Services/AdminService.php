<?php
/**
 * Admin Service
 * Centralized service for admin dashboard operations
 */

namespace SouthRingAutos\Services;

use SouthRingAutos\Database\Database;

class AdminService
{
    private $pdo;

    public function __construct()
    {
        $db = Database::getInstance();
        $this->pdo = $db->getConnection();
    }

    /**
     * Get dashboard statistics
     */
    public function getDashboardStats()
    {
        return [
            'totalBookings' => $this->getTotalBookings(),
            'pendingBookings' => $this->getPendingBookings(),
            'confirmedBookings' => $this->getConfirmedBookings(),
            'completedBookings' => $this->getCompletedBookings(),
            'totalPosts' => $this->getTotalPosts(),
            'totalClients' => $this->getTotalClients(),
            'pendingDeliveries' => $this->getPendingDeliveries(),
            'totalRevenue' => $this->getTotalRevenue(),
            'thisMonthRevenue' => $this->getThisMonthRevenue(),
            'recentPendingCount' => $this->getRecentPendingCount()
        ];
    }

    private function getTotalBookings()
    {
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM bookings");
        return $stmt->fetchColumn();
    }

    private function getPendingBookings()
    {
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM bookings WHERE status = 'pending'");
        return $stmt->fetchColumn();
    }

    private function getConfirmedBookings()
    {
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'");
        return $stmt->fetchColumn();
    }

    private function getCompletedBookings()
    {
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM bookings WHERE status = 'completed'");
        return $stmt->fetchColumn();
    }

    private function getTotalPosts()
    {
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM blog_posts");
        return $stmt->fetchColumn();
    }

    private function getTotalClients()
    {
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM clients");
        return $stmt->fetchColumn();
    }

    private function getPendingDeliveries()
    {
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM delivery_requests WHERE status = 'pending'");
        return $stmt->fetchColumn();
    }

    private function getTotalRevenue()
    {
        $stmt = $this->pdo->query("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed'");
        return $stmt->fetchColumn();
    }

    private function getThisMonthRevenue()
    {
        $stmt = $this->pdo->query("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed' AND MONTH(payment_date) = MONTH(CURDATE()) AND YEAR(payment_date) = YEAR(CURDATE())");
        return $stmt->fetchColumn();
    }

    private function getRecentPendingCount()
    {
        $stmt = $this->pdo->query("SELECT COUNT(*) FROM bookings WHERE status = 'pending' AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)");
        return $stmt->fetchColumn();
    }
}

