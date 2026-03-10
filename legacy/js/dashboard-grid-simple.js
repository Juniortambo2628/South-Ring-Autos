/**
 * Simplified Dashboard Grid Component
 * Works without GridJS dependency - uses native HTML tables
 */

const Fuse = require('fuse.js');

class SimpleDashboardGrid {
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
        this.data = [];
        this.filteredData = [];
        this.fuse = null;
        this.currentPage = 1;
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupSearch();
        this.setupFilters();
        this.render();
        this.setupContextMenu();
    }

    async loadData() {
        if (this.config.apiUrl) {
            try {
                const response = await fetch(this.config.apiUrl);
                const result = await response.json();
                this.data = result.data || result.bookings || result.posts || result;
                this.filteredData = [...this.data];
                this.setupFuzzySearch();
            } catch (error) {
                console.error('Error loading data:', error);
                this.data = [];
                this.filteredData = [];
            }
        } else if (this.config.data) {
            this.data = this.config.data;
            this.filteredData = [...this.data];
            this.setupFuzzySearch();
        }
    }

    setupFuzzySearch() {
        if (!this.config.searchable || !this.config.searchKeys) return;

        this.fuse = new Fuse(this.data, {
            keys: this.config.searchKeys,
            threshold: 0.3,
            includeScore: true
        });
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

    handleSearch(query) {
        if (!query.trim()) {
            this.filteredData = [...this.data];
        } else if (this.fuse) {
            const results = this.fuse.search(query);
            this.filteredData = results.map(result => result.item);
        } else {
            const lowerQuery = query.toLowerCase();
            this.filteredData = this.data.filter(item => {
                return this.config.searchKeys.some(key => {
                    const value = this.getNestedValue(item, key);
                    return value && value.toString().toLowerCase().includes(lowerQuery);
                });
            });
        }
        this.currentPage = 1;
        this.render();
    }

    handleFilter() {
        if (!this.config.filters) return;

        let filtered = [...this.data];

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
        this.currentPage = 1;
        this.render();
    }

    render() {
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
                    const displayValue = col.formatter 
                        ? col.formatter(value, item)
                        : (value || '');
                    html += `<td>${this.escapeHtml(displayValue)}</td>`;
                });
                html += '</tr>';
            });
        }

        html += '</tbody></table></div>';

        container.innerHTML = html;

        // Render pagination
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

        // Previous
        html += `<li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${this.currentPage - 1}">Previous</a>
        </li>`;

        // Page numbers
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

        // Next
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
                    this.render();
                }
            });
        });
    }

    setupContextMenu() {
        if (!this.config.contextMenu || this.config.contextMenu.length === 0) return;

        const container = document.getElementById(this.config.containerId);
        if (!container) return;

        let menu = document.getElementById(`${this.config.containerId}-context-menu`);
        if (!menu) {
            menu = document.createElement('div');
            menu.className = 'context-menu';
            menu.id = `${this.config.containerId}-context-menu`;
            document.body.appendChild(menu);
        }

        container.addEventListener('contextmenu', (e) => {
            const row = e.target.closest('tr[data-row-index]');
            if (row) {
                e.preventDefault();
                this.showContextMenu(e, row, menu);
            }
        });

        document.addEventListener('click', () => {
            menu.classList.remove('show');
        });
    }

    showContextMenu(event, row, menuElement) {
        const rowIndex = parseInt(row.dataset.rowIndex);
        const rowData = this.filteredData[rowIndex] || {};
        
        menuElement.innerHTML = this.config.contextMenu.map(item => {
            const icon = item.icon ? `<i class="${item.icon}"></i>` : '';
            const dangerClass = item.danger ? 'danger' : '';
            return `
                <div class="context-menu-item ${dangerClass}">
                    ${icon}
                    <span>${item.label}</span>
                </div>
            `;
        }).join('');

        menuElement.style.left = `${event.clientX}px`;
        menuElement.style.top = `${event.clientY}px`;
        menuElement.classList.add('show');

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

    getNestedValue(obj, path) {
        if (!path) return null;
        return path.split('.').reduce((o, p) => o && o[p], obj);
    }

    escapeHtml(text) {
        if (!text) return '';
        const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
        return text.toString().replace(/[&<>"']/g, m => map[m]);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SimpleDashboardGrid };
}

window.SimpleDashboardGrid = SimpleDashboardGrid;

