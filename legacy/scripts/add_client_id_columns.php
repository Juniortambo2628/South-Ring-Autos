<?php
// One-off migration to ensure client_id exists on bookings and payments and is backfilled
// Usage: php scripts/add_client_id_columns.php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

use SouthRingAutos\Database\Database;

function columnExists(PDO $pdo, string $table, string $column): bool {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?");
    $stmt->execute([$table, $column]);
    return (int)$stmt->fetchColumn() > 0;
}

function indexExists(PDO $pdo, string $table, string $indexName): bool {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?");
    $stmt->execute([$table, $indexName]);
    return (int)$stmt->fetchColumn() > 0;
}

function foreignKeyExists(PDO $pdo, string $table, string $constraintName): bool {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?");
    $stmt->execute([$table, $constraintName]);
    return (int)$stmt->fetchColumn() > 0;
}

function execSilently(PDO $pdo, string $sql): void {
    try {
        $pdo->exec($sql);
    } catch (Throwable $e) {
        // Ignore if it already exists or any harmless duplication
    }
}

try {
    $pdo = Database::getInstance()->getConnection();

    // 1) bookings.client_id
    if (!columnExists($pdo, 'bookings', 'client_id')) {
        $pdo->exec("ALTER TABLE bookings ADD COLUMN client_id INT NULL AFTER id");
    }
    if (!indexExists($pdo, 'bookings', 'idx_client_id')) {
        execSilently($pdo, "ALTER TABLE bookings ADD INDEX idx_client_id (client_id)");
    }
    if (!foreignKeyExists($pdo, 'bookings', 'fk_bookings_client')) {
        execSilently($pdo, "ALTER TABLE bookings ADD CONSTRAINT fk_bookings_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL");
    }

    // 2) payments.client_id
    if (!columnExists($pdo, 'payments', 'client_id')) {
        $pdo->exec("ALTER TABLE payments ADD COLUMN client_id INT NULL AFTER booking_id");
    }
    if (!indexExists($pdo, 'payments', 'idx_payments_client')) {
        execSilently($pdo, "ALTER TABLE payments ADD INDEX idx_payments_client (client_id)");
    }
    if (!foreignKeyExists($pdo, 'payments', 'fk_payments_client')) {
        execSilently($pdo, "ALTER TABLE payments ADD CONSTRAINT fk_payments_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL");
    }

    // 3) Backfill bookings.client_id by email/phone
    $pdo->exec(
        "UPDATE bookings b \n" .
        "JOIN clients c ON (b.email IS NOT NULL AND b.email <> '' AND c.email = b.email) \n" .
        "   OR (b.phone IS NOT NULL AND b.phone <> '' AND c.phone = b.phone) \n" .
        "SET b.client_id = c.id \n" .
        "WHERE b.client_id IS NULL"
    );

    // 4) Backfill payments.client_id from bookings
    $pdo->exec(
        "UPDATE payments p \n" .
        "JOIN bookings b ON p.booking_id = b.id \n" .
        "SET p.client_id = b.client_id \n" .
        "WHERE p.client_id IS NULL"
    );

    // Quick verification: counts per requirement fields exist now
    $verifications = [];
    foreach ([
        'bookings.client_id' => "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='bookings' AND COLUMN_NAME='client_id'",
        'payments.client_id' => "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='payments' AND COLUMN_NAME='client_id'"
    ] as $label => $sql) {
        $verifications[$label] = (int)$pdo->query($sql)->fetchColumn() > 0 ? 'OK' : 'MISSING';
    }

    echo "Migration completed.\n";
    foreach ($verifications as $k => $v) {
        echo $k . ': ' . $v . "\n";
    }
} catch (Throwable $e) {
    fwrite(STDERR, 'Migration failed: ' . $e->getMessage() . "\n");
    exit(1);
}


