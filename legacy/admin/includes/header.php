<?php
/**
 * Admin Header
 * Centralized header component for admin pages
 */

$pageTitle = $pageTitle ?? 'Admin Dashboard | South Ring Autos';
$showNotifications = $showNotifications ?? false;
$recentPendingCount = $recentPendingCount ?? 0;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title><?php echo htmlspecialchars($pageTitle); ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="../css/bootstrap.min.css" rel="stylesheet">
    <link href="../css/admin.css" rel="stylesheet">
    <link href="../css/hero-section.css" rel="stylesheet">
    <link href="../css/dashboard-components.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/gridjs/dist/theme/mermaid.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" crossorigin="anonymous">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/gridjs/dist/gridjs.umd.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></script>
    <?php if (isset($additionalCSS)): ?>
        <?php foreach ($additionalCSS as $css): ?>
            <link href="<?php echo htmlspecialchars($css); ?>" rel="stylesheet">
        <?php endforeach; ?>
    <?php endif; ?>
    <?php if (isset($additionalJS)): ?>
        <?php foreach ($additionalJS as $js): ?>
            <script src="<?php echo htmlspecialchars($js); ?>"></script>
        <?php endforeach; ?>
    <?php endif; ?>
</head>
<body class="admin-body">
    <nav class="navbar navbar-expand-lg admin-navbar">
        <div class="container-fluid">
            <img src="../South-ring-logos/SR-Logo-White-BG.png" alt="South Ring Autos" class="admin-logo" onerror="this.style.display='none'">
            <span class="navbar-brand">South Ring Autos - Admin Dashboard</span>
            <div>
                <?php if ($showNotifications): ?>
                    <span class="notification-bell me-3" onclick="toggleNotifications()" title="Notifications">
                        <i class="fas fa-bell"></i>
                        <?php if ($recentPendingCount > 0): ?>
                            <span class="notification-badge"><?php echo $recentPendingCount; ?></span>
                        <?php endif; ?>
                    </span>
                <?php endif; ?>
                <span class="text-white me-3"><i class="fas fa-user-circle me-2"></i>Welcome, <?php echo htmlspecialchars(\SouthRingAutos\Utils\SessionManager::get('admin_username', 'admin')); ?></span>
                <a href="logout.php" class="btn btn-pill btn-outline-light btn-sm"><i class="fas fa-sign-out-alt me-2"></i>Logout</a>
            </div>
        </div>
    </nav>

