/**
 * Reusable Dashboard Components
 * Grid View, Search, Filters, Pagination, Context Menu
 * 
 * Note: GridJS is loaded via CDN. For a simpler implementation without GridJS,
 * use SimpleDashboardGrid from dashboard-grid-simple.js
 */

const Fuse = require('fuse.js');

/**
 * Dashboard Grid Component
 */
/* eslint-env browser */
/* global Grid */
/* eslint-disable no-console */
class DashboardGrid {
    constructor(config) {
        this.config = {
            containerId: config.containerId || 'grid-container',
            apiUrl: config.apiUrl || '',
            columns: config.columns || [],
            searchable: config.searchable !== false,
            filterable: config.filterable !== false,
            pagination: config.pagination !== false,
            pageSize: config.pageSize || 10,
            contextMenu: config.contextMenu || [],
            ...config
        };
        this.grid = null;
        this.data = [];
        this.filteredData = [];
        this.fuse = null;
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupSearch();
        this.setupFilters();
        // Wait for GridJS to load if using CDN (script loads synchronously in head, but check anyway)
        if (typeof window !== 'undefined' && typeof window.Grid === 'undefined' && typeof Grid === 'undefined') {
            // Wait a bit for CDN script to load (max 3 seconds)
            await new Promise(resolve => {
                let attempts = 0;
                const maxAttempts = 30; // 3 seconds max
                const checkGrid = setInterval(() => {
                    attempts++;
                    const gridAvailable = (typeof window !== 'undefined' && (window.Grid || window.gridjs?.Grid)) || typeof Grid !== 'undefined';
                    if (gridAvailable || attempts >= maxAttempts) {
                        clearInterval(checkGrid);
                        resolve();
                    }
                }, 100);
            });
        }
        this.setupGrid();
        this.setupContextMenu();
    }

    setupSearch() {
        if (!this.config.searchable) return;

        const searchContainer = document.getElementById(this.config.searchContainerId || 'search-container');
        if (!searchContainer) return;

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'form-control form-control-glass';
        searchInput.placeholder = 'Search...';
        searchInput.id = `${this.config.containerId}-search`;

        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        searchContainer.appendChild(searchInput);
    }

    setupFilters() {
        if (!this.config.filterable || !this.config.filters) return;

        const filterContainer = document.getElementById(this.config.filterContainerId || 'filter-container');
        if (!filterContainer) return;

        this.config.filters.forEach(filter => {
            const select = document.createElement('select');
            select.className = 'form-select form-control-glass';
            select.id = `${this.config.containerId}-filter-${filter.key}`;
            
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = `All ${filter.label}`;
            select.appendChild(defaultOption);

            filter.options.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option.value;
                opt.textContent = option.label;
                select.appendChild(opt);
            });

            select.addEventListener('change', () => {
                this.handleFilter();
            });

            filterContainer.appendChild(select);
        });
    }

    setupGrid() {
        const container = document.getElementById(this.config.containerId);
        if (!container) return;

        // Check if GridJS is available (loaded via CDN)
        // GridJS UMD exposes it as window.Grid or just Grid
        // Also check for gridjs namespace
        let GridJS = null;
        
        if (typeof window !== 'undefined') {
            GridJS = window.Grid || window.gridjs?.Grid || (typeof Grid !== 'undefined' ? Grid : null);
        } else if (typeof Grid !== 'undefined') {
            GridJS = Grid;
        }
        
        if (!GridJS) {
            console.warn('GridJS not loaded. Using simple table fallback.');
            // Fallback to simple table
            this.renderSimpleTable();
            return;
        }

        // Transform columns to GridJS format with HTML support
        const gridColumns = this.config.columns.map(col => {
            if (col.formatter) {
                // If formatter exists, wrap it to support GridJS html() function
                return {
                    name: col.name || col.label || col.id,
                    formatter: (cell, row) => {
                        // Get the full row data for formatter
                        const rowData = row ? row._cells : null;
                        const fullRow = rowData ? rowData.reduce((acc, cell, idx) => {
                            const colId = this.config.columns[idx]?.id;
                            if (colId) acc[colId] = cell.data;
                            return acc;
                        }, {}) : null;
                        
                        const formatted = col.formatter(cell, fullRow || row);
                        // Check if GridJS html function is available
                        if (typeof GridJS !== 'undefined' && GridJS.html) {
                            return GridJS.html(formatted);
                        } else if (typeof window !== 'undefined' && window.gridjs && window.gridjs.html) {
                            return window.gridjs.html(formatted);
                        }
                        // Fallback: return as string (will be escaped by GridJS)
                        return formatted;
                    }
                };
            }
            return {
                name: col.name || col.label || col.id
            };
        });

        const gridConfig = {
            columns: gridColumns,
            data: this.filteredData.map((row) => {
                // Map row data to array format expected by GridJS
                return this.config.columns.map(col => {
                    const value = this.getNestedValue(row, col.id || col.field || col.name);
                    return value;
                });
            }),
            search: false, // We handle search ourselves
            pagination: this.config.pagination ? {
                enabled: true,
                limit: this.config.pageSize
            } : false,
            sort: true,
            resizable: true,
            style: {
                table: {
                    'background-color': 'var(--admin-dark-card)',
                    color: 'var(--admin-text-primary)'
                },
                th: {
                    'background-color': 'var(--admin-dark-surface)',
                    color: 'var(--admin-text-primary)',
                    border: '1px solid var(--admin-border)'
                },
                td: {
                    'background-color': 'var(--admin-dark-card)',
                    color: 'var(--admin-text-primary)',
                    border: '1px solid var(--admin-border)'
                }
            }
        };

        try {
            this.grid = new GridJS(gridConfig);
            this.grid.render(container);
        } catch (error) {
            console.error('Error initializing GridJS:', error);
            console.warn('Falling back to simple table.');
            this.renderSimpleTable();
        }
    }

    render() {
        if (this.grid) {
            this.updateGrid();
        } else {
            this.renderSimpleTable();
        }
    }

    renderSimpleTable() {
        const container = document.getElementById(this.config.containerId);
        if (!container) return;

        const startIndex = (this.currentPage - 1) * this.config.pageSize;
        const endIndex = startIndex + this.config.pageSize;
        const pageData = this.config.pagination 
            ? this.filteredData.slice(startIndex, endIndex)
            : this.filteredData;

        let html = '<div class="table-responsive"><table class="table table-glass"><thead><tr>';
        
        this.config.columns.forEach(col => {
            html += `<th>${col.name || col.label || col.id}</th>`;
        });
        
        html += '</tr></thead><tbody>';

        if (pageData.length === 0) {
            html += `<tr><td colspan="${this.config.columns.length}" class="text-center py-4">
                <p class="text-muted mb-0">No data found</p>
            </td></tr>`;
        } else {
            pageData.forEach((item, index) => {
                html += '<tr data-row-index="' + (startIndex + index) + '">';
                this.config.columns.forEach(col => {
                    const value = this.getNestedValue(item, col.id || col.field || col.name);
                    // Use formatter if available, but don't escape HTML (formatter should handle it)
                    const displayValue = col.formatter 
                        ? col.formatter(value, item)
                        : (value || '');
                    // Only escape if formatter wasn't used (to preserve HTML from formatter)
                    const finalValue = col.formatter ? displayValue : this.escapeHtml(displayValue);
                    html += `<td>${finalValue}</td>`;
                });
                html += '</tr>';
            });
        }

        html += '</tbody></table></div>';

        container.innerHTML = html;

        if (this.config.pagination) {
            this.renderPagination();
        }
    }

    renderPagination() {
        const paginationContainer = document.getElementById(this.config.paginationContainerId || 'pagination-container');
        if (!paginationContainer) return;

        const totalPages = Math.ceil(this.filteredData.length / this.config.pageSize);
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let html = '<nav aria-label="Page navigation"><ul class="pagination">';

        html += `<li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${this.currentPage - 1}">Previous</a>
        </li>`;

        const maxVisible = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        if (startPage > 1) {
            html += `<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>`;
            if (startPage > 2) html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `<li class="page-item ${i === this.currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>`;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            html += `<li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a></li>`;
        }

        html += `<li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${this.currentPage + 1}">Next</a>
        </li>`;

        html += '</ul></nav>';

        paginationContainer.innerHTML = html;

        paginationContainer.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(link.dataset.page);
                if (page && page !== this.currentPage && page >= 1 && page <= totalPages) {
                    this.currentPage = page;
                    if (this.grid) {
                        this.updateGrid();
                    } else {
                        this.renderSimpleTable();
                    }
                }
            });
        });
    }

    async loadData() {
        if (this.config.apiUrl) {
            try {
                const response = await fetch(this.config.apiUrl);
                const result = await response.json();
                // Ensure data is always an array
                // Check for common API response formats: data, bookings, brands, posts, items, results, etc.
                const rawData = result.data || result.bookings || result.brands || result.posts || result.items || result.results || result;
                this.data = Array.isArray(rawData) ? rawData : (rawData && typeof rawData === 'object' ? [] : (rawData ? [rawData] : []));
                this.filteredData = [...this.data];
                this.setupFuzzySearch();
                return this.filteredData;
            } catch (error) {
                console.error('Error loading data:', error);
                this.data = [];
                this.filteredData = [];
                return [];
            }
        } else if (this.config.data) {
            // Ensure data is always an array
            this.data = Array.isArray(this.config.data) ? this.config.data : (this.config.data ? [this.config.data] : []);
            this.filteredData = [...this.data];
            this.setupFuzzySearch();
            return this.filteredData;
        }
        this.data = [];
        this.filteredData = [];
        return [];
    }

    setupFuzzySearch() {
        if (!this.config.searchable || !this.config.searchKeys) return;

        this.fuse = new Fuse(this.data, {
            keys: this.config.searchKeys,
            threshold: 0.3,
            includeScore: true
        });
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.filteredData = Array.isArray(this.data) ? [...this.data] : [];
        } else if (this.fuse) {
            const results = this.fuse.search(query);
            this.filteredData = results.map(result => result.item);
        } else {
            // Simple text search
            const lowerQuery = query.toLowerCase();
            this.filteredData = this.data.filter(item => {
                return this.config.searchKeys.some(key => {
                    const value = this.getNestedValue(item, key);
                    return value && value.toString().toLowerCase().includes(lowerQuery);
                });
            });
        }
        this.updateGrid();
    }

    handleFilter() {
        if (!this.config.filters) return;

        let filtered = Array.isArray(this.data) ? [...this.data] : [];

        this.config.filters.forEach(filter => {
            const select = document.getElementById(`${this.config.containerId}-filter-${filter.key}`);
            if (select && select.value) {
                filtered = filtered.filter(item => {
                    const value = this.getNestedValue(item, filter.key);
                    return value == select.value;
                });
            }
        });

        this.filteredData = filtered;
        this.updateGrid();
    }

    updateGrid() {
        if (this.grid && typeof this.grid.updateConfig === 'function') {
            try {
                this.grid.updateConfig({
                    data: this.filteredData
                }).forceRender();
            } catch (error) {
                console.error('Error updating GridJS:', error);
                this.renderSimpleTable();
            }
        } else {
            this.renderSimpleTable();
        }
    }

    setupContextMenu() {
        if (!this.config.contextMenu || this.config.contextMenu.length === 0) return;

        const container = document.getElementById(this.config.containerId);
        if (!container) return;

        // Create context menu element
        let menu = document.getElementById(`${this.config.containerId}-context-menu`);
        if (!menu) {
            menu = document.createElement('div');
            menu.className = 'context-menu';
            menu.id = `${this.config.containerId}-context-menu`;
            document.body.appendChild(menu);
        }

        // Wait for grid to render, then attach event listener
        setTimeout(() => {
            const gridTable = container.querySelector('table');
            if (gridTable) {
                gridTable.addEventListener('contextmenu', (e) => {
                    const row = e.target.closest('tr');
                    if (row && !row.classList.contains('gridjs-header')) {
                        e.preventDefault();
                        this.showContextMenu(e, row, menu);
                    }
                });
            }
        }, 500);

        // Hide menu on click outside
        document.addEventListener('click', () => {
            menu.classList.remove('show');
        });
    }

    showContextMenu(event, row, menuElement) {
        const rowData = this.getRowData(row);
        
        menuElement.innerHTML = this.config.contextMenu.map(item => {
            const icon = item.icon ? `<i class="${item.icon}"></i>` : '';
            const dangerClass = item.danger ? 'danger' : '';
            return `
                <div class="context-menu-item ${dangerClass}" data-action="${item.key || ''}">
                    ${icon}
                    <span>${item.label}</span>
                </div>
            `;
        }).join('');

        menuElement.style.left = `${event.clientX}px`;
        menuElement.style.top = `${event.clientY}px`;
        menuElement.classList.add('show');

        // Add click handlers
        menuElement.querySelectorAll('.context-menu-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                const menuItem = this.config.contextMenu[index];
                if (menuItem && menuItem.action) {
                    menuItem.action(rowData, row);
                }
                menuElement.classList.remove('show');
            });
        });
    }

    getRowData(row) {
        // Try to get from data-index attribute first
        const rowIndex = row.dataset.rowIndex ? parseInt(row.dataset.rowIndex) : null;
        if (rowIndex !== null && this.filteredData[rowIndex]) {
            return this.filteredData[rowIndex];
        }
        
        // Fallback: extract from cells
        const cells = row.querySelectorAll('td');
        const data = {};
        this.config.columns.forEach((col, index) => {
            const key = col.id || col.name || col.field || index;
            data[key] = cells[index]?.textContent?.trim();
        });
        return data;
    }

    escapeHtml(text) {
        if (!text) return '';
        const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
        return text.toString().replace(/[&<>"']/g, m => map[m]);
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((o, p) => o && o[p], obj);
    }
}

/**
 * Pagination Component
 */
class Pagination {
    constructor(config) {
        this.config = {
            containerId: config.containerId || 'pagination-container',
            totalItems: config.totalItems || 0,
            itemsPerPage: config.itemsPerPage || 10,
            currentPage: config.currentPage || 1,
            onPageChange: config.onPageChange || (() => {}),
            ...config
        };
        this.render();
    }

    render() {
        const container = document.getElementById(this.config.containerId);
        if (!container) return;

        const totalPages = Math.ceil(this.config.totalItems / this.config.itemsPerPage);
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = '<nav aria-label="Page navigation"><ul class="pagination">';

        // Previous button
        html += `<li class="page-item ${this.config.currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${this.config.currentPage - 1}">Previous</a>
        </li>`;

        // Page numbers
        const maxVisible = 5;
        let startPage = Math.max(1, this.config.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        if (startPage > 1) {
            html += `<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>`;
            if (startPage > 2) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `<li class="page-item ${i === this.config.currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>`;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
            html += `<li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a></li>`;
        }

        // Next button
        html += `<li class="page-item ${this.config.currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${this.config.currentPage + 1}">Next</a>
        </li>`;

        html += '</ul></nav>';

        container.innerHTML = html;

        // Add event listeners
        container.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(link.dataset.page);
                if (page && page !== this.config.currentPage && page >= 1 && page <= totalPages) {
                    this.config.currentPage = page;
                    this.config.onPageChange(page);
                    this.render();
                }
            });
        });
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DashboardGrid, Pagination };
}

// Make available globally
window.DashboardGrid = DashboardGrid;
window.Pagination = Pagination;

