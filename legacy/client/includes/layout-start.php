<?php
/**
 * Client Layout Start Component
 * Opens the client layout structure
 * 
 * @param string $pageTitle Page title
 * @param array $extraStylesheets Additional CSS files
 */
$pageTitle = $pageTitle ?? 'Client Portal | South Ring Autos';
$extraStylesheets = $extraStylesheets ?? [];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title><?php echo htmlspecialchars($pageTitle); ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="../css/bootstrap.min.css" rel="stylesheet">
    <link href="../css/style.css" rel="stylesheet">
    <link href="../css/client.css" rel="stylesheet">
    <link href="../css/hero-section.css" rel="stylesheet">
    <link href="../css/dashboard-components.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/gridjs/dist/theme/mermaid.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/gridjs/dist/gridjs.umd.js"></script>
    <?php foreach ($extraStylesheets as $stylesheet): ?>
        <link href="<?php echo htmlspecialchars($stylesheet); ?>" rel="stylesheet">
    <?php endforeach; ?>
</head>
<body>
    <div class="client-layout">
        <?php include __DIR__ . '/sidebar.php'; ?>
        <main class="client-content">
            <?php include __DIR__ . '/header.php'; ?>
            <div class="client-content__inner">

