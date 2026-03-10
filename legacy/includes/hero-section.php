<?php
/**
 * Reusable Hero Section Component
 * 
 * @param array $config Configuration array:
 *   - 'title' (string): Main page title
 *   - 'subtitle' (string): Page subtitle/description
 *   - 'bgImage' (string): Background image URL (optional, defaults to gradient)
 *   - 'breadcrumbs' (array): Array of breadcrumb items [['label' => 'Home', 'url' => '/']]
 *   - 'icon' (string): Font Awesome icon class (optional)
 *   - 'theme' (string): 'admin' or 'client' (defaults to 'admin')
 */
$config = $config ?? [];
$title = $config['title'] ?? 'Dashboard';
$subtitle = $config['subtitle'] ?? '';
$bgImage = $config['bgImage'] ?? null;
$breadcrumbs = $config['breadcrumbs'] ?? [];
$icon = $config['icon'] ?? 'fas fa-tachometer-alt';
$theme = $config['theme'] ?? 'admin';

// Default breadcrumbs if none provided
if (empty($breadcrumbs)) {
    if ($theme === 'admin') {
        $breadcrumbs = [
            ['label' => 'Dashboard', 'url' => 'dashboard.php']
        ];
    } else {
        $breadcrumbs = [
            ['label' => 'Dashboard', 'url' => 'dashboard.php']
        ];
    }
}

// Add current page to breadcrumbs if not already there
$currentPage = basename($_SERVER['PHP_SELF']);
$lastBreadcrumb = end($breadcrumbs);
if (!$lastBreadcrumb || $lastBreadcrumb['label'] !== $title) {
    $breadcrumbs[] = ['label' => $title, 'url' => $currentPage, 'active' => true];
}

$bgStyle = '';
if ($bgImage) {
    $bgStyle = "background-image: url('{$bgImage}');";
} else {
    // Default gradient
    $bgStyle = "background: linear-gradient(135deg, #D81324 0%, #8B0A13 100%);";
}
?>
<div class="hero-section" style="<?php echo $bgStyle; ?>">
    <div class="hero-overlay"></div>
    <div class="hero-content">
        <nav aria-label="breadcrumb" class="hero-breadcrumb">
            <ol class="breadcrumb">
                <?php foreach ($breadcrumbs as $index => $crumb): ?>
                    <?php if (isset($crumb['active']) && $crumb['active']): ?>
                        <li class="breadcrumb-item active" aria-current="page">
                            <?php echo htmlspecialchars($crumb['label']); ?>
                        </li>
                    <?php else: ?>
                        <li class="breadcrumb-item">
                            <a href="<?php echo htmlspecialchars($crumb['url']); ?>">
                                <?php echo htmlspecialchars($crumb['label']); ?>
                            </a>
                        </li>
                    <?php endif; ?>
                <?php endforeach; ?>
            </ol>
        </nav>
        <div class="hero-info">
            <h1 class="hero-title">
                <?php if ($icon): ?>
                    <i class="<?php echo htmlspecialchars($icon); ?> me-2"></i>
                <?php endif; ?>
                <?php echo htmlspecialchars($title); ?>
            </h1>
            <?php if ($subtitle): ?>
                <p class="hero-subtitle"><?php echo htmlspecialchars($subtitle); ?></p>
            <?php endif; ?>
        </div>
    </div>
</div>

