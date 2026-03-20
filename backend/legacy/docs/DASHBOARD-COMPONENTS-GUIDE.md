# Dashboard Components Guide

## Overview

Reusable dashboard components for admin and client dashboards including:
- Hero Section with breadcrumbs
- Grid View with AJAX data loading
- Right-click context menu
- AJAX search with fuzzy search
- Filters
- Pagination

## Installation

All npm dependencies are already installed:
- `fuse.js` - Fuzzy search
- `gridjs` - Grid view component
- `right-click-menu` - Context menu

## Hero Section

### Usage

```php
<?php
$heroConfig = [
    'title' => 'Page Title',
    'subtitle' => 'Page description',
    'icon' => 'fas fa-icon-name',
    'theme' => 'admin', // or 'client'
    'bgImage' => 'path/to/image.jpg', // optional
    'breadcrumbs' => [
        ['label' => 'Home', 'url' => 'dashboard.php'],
        ['label' => 'Current Page', 'url' => 'current.php', 'active' => true]
    ]
];
include __DIR__ . '/../includes/hero-section.php';
?>
```

## Grid View Component

### Basic Usage

```javascript
const grid = new DashboardGrid({
    containerId: 'grid-container',
    apiUrl: '../api/bookings.php?action=list',
    columns: [
        { id: 'id', name: 'ID' },
        { id: 'name', name: 'Name' },
        { id: 'service', name: 'Service' },
        { id: 'status', name: 'Status' }
    ],
    searchable: true,
    searchKeys: ['name', 'service', 'status'],
    filterable: true,
    filters: [
        {
            key: 'status',
            label: 'Status',
            options: [
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' }
            ]
        }
    ],
    pagination: true,
    pageSize: 10,
    contextMenu: [
        {
            label: 'View Details',
            icon: 'fas fa-eye',
            action: (rowData) => {
                window.location.href = `details.php?id=${rowData.id}`;
            }
        },
        {
            label: 'Edit',
            icon: 'fas fa-edit',
            action: (rowData) => {
                window.location.href = `edit.php?id=${rowData.id}`;
            }
        },
        {
            label: 'Delete',
            icon: 'fas fa-trash',
            danger: true,
            action: (rowData) => {
                if (confirm('Delete this item?')) {
                    // Delete logic
                }
            }
        }
    ]
});
```

### HTML Structure

```html
<!-- Search Container -->
<div id="search-container"></div>

<!-- Filter Container -->
<div id="filter-container"></div>

<!-- Grid Container -->
<div id="grid-container"></div>

<!-- Pagination Container -->
<div id="pagination-container"></div>
```

## Pagination Component

### Usage

```javascript
const pagination = new Pagination({
    containerId: 'pagination-container',
    totalItems: 100,
    itemsPerPage: 10,
    currentPage: 1,
    onPageChange: (page) => {
        console.log('Page changed to:', page);
        // Reload data for new page
    }
});
```

## Example: Admin Bookings Page

```php
<?php
// In admin/bookings.php
$heroConfig = [
    'title' => 'Bookings',
    'subtitle' => 'Manage all service bookings',
    'icon' => 'fas fa-calendar-check',
    'theme' => 'admin',
    'breadcrumbs' => [
        ['label' => 'Dashboard', 'url' => 'dashboard.php'],
        ['label' => 'Bookings', 'url' => 'bookings.php', 'active' => true]
    ]
];
include __DIR__ . '/../includes/hero-section.php';
?>

<div id="search-container"></div>
<div id="filter-container"></div>
<div id="grid-container"></div>
<div id="pagination-container"></div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const grid = new DashboardGrid({
        containerId: 'grid-container',
        searchContainerId: 'search-container',
        filterContainerId: 'filter-container',
        apiUrl: '../api/bookings.php?action=list',
        columns: [
            { id: 'id', name: 'ID' },
            { id: 'name', name: 'Client Name' },
            { id: 'service', name: 'Service' },
            { id: 'status', name: 'Status' },
            { id: 'created_at', name: 'Date' }
        ],
        searchable: true,
        searchKeys: ['name', 'service', 'registration', 'status'],
        filterable: true,
        filters: [
            {
                key: 'status',
                label: 'Status',
                options: [
                    { value: 'pending', label: 'Pending' },
                    { value: 'confirmed', label: 'Confirmed' },
                    { value: 'completed', label: 'Completed' }
                ]
            }
        ],
        pagination: true,
        pageSize: 20,
        contextMenu: [
            {
                label: 'View Details',
                icon: 'fas fa-eye',
                action: (data) => {
                    window.location.href = `bookings.php?view=${data.id}`;
                }
            },
            {
                label: 'Edit',
                icon: 'fas fa-edit',
                action: (data) => {
                    window.location.href = `bookings.php?edit=${data.id}`;
                }
            },
            {
                label: 'Delete',
                icon: 'fas fa-trash',
                danger: true,
                action: (data) => {
                    if (confirm('Delete this booking?')) {
                        fetch(`../api/bookings.php?action=delete`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: `id=${data.id}`
                        }).then(() => location.reload());
                    }
                }
            }
        ]
    });
});
</script>
```

## API Response Format

The API should return data in one of these formats:

```json
{
    "success": true,
    "data": [
        { "id": 1, "name": "John Doe", "service": "Oil Change" },
        { "id": 2, "name": "Jane Smith", "service": "Brake Repair" }
    ]
}
```

Or simply an array:

```json
[
    { "id": 1, "name": "John Doe", "service": "Oil Change" },
    { "id": 2, "name": "Jane Smith", "service": "Brake Repair" }
]
```

## Styling

All components are styled to match the dark theme. Custom CSS variables are used:
- `--admin-dark-bg`
- `--admin-dark-surface`
- `--admin-dark-card`
- `--admin-text-primary`
- `--admin-primary`

For client theme, use `client-theme` class on the hero section.

