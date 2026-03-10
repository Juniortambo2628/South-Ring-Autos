<?php
/**
 * Booking Service
 * Centralized service for booking operations
 */

namespace SouthRingAutos\Services;

use SouthRingAutos\Database\Database;
use PDO;

class BookingService
{
    private $pdo;

    public function __construct()
    {
        $db = Database::getInstance();
        $this->pdo = $db->getConnection();
    }

    /**
     * Get all bookings with optional filters
     */
    public function getAllBookings($status = null, $limit = null, $offset = 0)
    {
        $sql = "SELECT b.*, c.name as client_name, c.email as client_email, c.phone as client_phone 
                FROM bookings b 
                LEFT JOIN clients c ON b.client_id = c.id";
        
        $params = [];
        if ($status) {
            $sql .= " WHERE b.status = :status";
            $params[':status'] = $status;
        }
        
        $sql .= " ORDER BY b.created_at DESC";
        
        if ($limit) {
            $sql .= " LIMIT :limit OFFSET :offset";
            $params[':limit'] = $limit;
            $params[':offset'] = $offset;
        }
        
        $stmt = $this->pdo->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value, is_numeric($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
        }
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get booking by ID
     */
    public function getBookingById($id)
    {
        $stmt = $this->pdo->prepare("SELECT b.*, c.name as client_name, c.email as client_email, c.phone as client_phone 
                                     FROM bookings b 
                                     LEFT JOIN clients c ON b.client_id = c.id 
                                     WHERE b.id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Update booking status
     */
    public function updateBookingStatus($id, $status)
    {
        $stmt = $this->pdo->prepare("UPDATE bookings SET status = :status, updated_at = NOW() WHERE id = :id");
        return $stmt->execute([':status' => $status, ':id' => $id]);
    }

    /**
     * Get bookings count by status
     */
    public function getBookingsCountByStatus($status)
    {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM bookings WHERE status = :status");
        $stmt->execute([':status' => $status]);
        return $stmt->fetchColumn();
    }
}

