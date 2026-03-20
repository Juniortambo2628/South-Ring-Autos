<?php
/**
 * Client Layout End Component
 * Closes the client layout structure
 * 
 * @param array $extraScripts Additional JavaScript files
 */
$extraScripts = $extraScripts ?? [];
?>
            </div>
        </main>
    </div>
    
    <!-- Mobile Sidebar Overlay -->
    <div class="client-sidebar-overlay" id="sidebarOverlay"></div>
    
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../js/dist/dashboard-components.bundle.js"></script>
    <script>
    // Mobile Sidebar Toggle
    (function() {
        const sidebar = document.getElementById('clientSidebar');
        const toggle = document.getElementById('sidebarToggle');
        const close = document.getElementById('sidebarClose');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && toggle) {
            function openSidebar() {
                sidebar.classList.add('active');
                if (overlay) overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
            
            function closeSidebar() {
                sidebar.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
            
            toggle.addEventListener('click', openSidebar);
            if (close) close.addEventListener('click', closeSidebar);
            if (overlay) overlay.addEventListener('click', closeSidebar);
            
            // Close on escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && sidebar.classList.contains('active')) {
                    closeSidebar();
                }
            });
        }
    })();
    </script>
    <?php foreach ($extraScripts as $script): ?>
        <script src="<?php echo htmlspecialchars($script); ?>"></script>
    <?php endforeach; ?>
</body>
</html>

