document.addEventListener('DOMContentLoaded', async () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    if (typeof DataManager !== 'undefined' && DataManager.initializeData) {
        await DataManager.initializeData();
    }

    updateDashboardUI();

    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');

    if (searchInput) searchInput.addEventListener('input', handleFilterChange);
    if (categoryFilter) categoryFilter.addEventListener('change', handleFilterChange);
    if (statusFilter) statusFilter.addEventListener('change', handleFilterChange);
    if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetFilters);
    if (exportCsvBtn) exportCsvBtn.addEventListener('click', () => DataManager.exportToCSV());

    setupLogout();

    setInterval(() => {
        if (typeof DataManager !== 'undefined' && DataManager.simulateInventoryChange) {
            const updatedItem = DataManager.simulateInventoryChange();
            if (updatedItem) {
                updateDashboardUI();
            }
        }
    }, 8000);
});

function updateDashboardUI() {
    renderTable();
    renderMetrics();
    renderAlerts();
    if (typeof ChartManager !== 'undefined') {
        ChartManager.updateAllCharts();
    }
}

function handleFilterChange() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');

    const query = searchInput ? searchInput.value : '';
    const category = categoryFilter ? categoryFilter.value : 'all';
    const status = statusFilter ? statusFilter.value : 'all';

    if (typeof DataManager !== 'undefined') {
        DataManager.applyFilters({ query, category, status });
    }
    
    updateDashboardUI();
}

function resetFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');

    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = 'all';
    if (statusFilter) statusFilter.value = 'all';
    handleFilterChange();
}

function renderTable() {
    const tbody = document.getElementById('inventoryTableBody');
    if (!tbody) return;

    const products = typeof DataManager !== 'undefined' ? DataManager.getProducts() : [];
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.trim() : '';
    
    const itemCountEl = document.getElementById('tableItemCount');
    if (itemCountEl) itemCountEl.textContent = `${products.length} items`;
    
    tbody.innerHTML = ''; 
    
    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No matching inventory products found.</td></tr>`;
        return;
    }

    products.forEach(p => {
        const tr = document.createElement('tr');
        
        if (p.status === 'low stock') tr.classList.add('low-stock-row');
        if (p.status === 'out of stock') tr.classList.add('out-of-stock-row');

        const totalVal = (p.price * p.quantity).toFixed(2);
        const highlightedName = highlightText(p.name, query);
        const highlightedSku = highlightText(p.sku, query);

        let badgeClass = 'bg-success';
        if (p.status === 'low stock') badgeClass = 'bg-warning text-dark';
        if (p.status === 'out of stock') badgeClass = 'bg-danger';

        tr.innerHTML = `
            <td class="fw-medium">${highlightedSku}</td>
            <td>${highlightedName}</td>
            <td><span class="badge bg-light text-dark border">${p.category}</span></td>
            <td>₱${p.price.toFixed(2)}</td>
            <td class="fw-bold">${p.quantity}</td>
            <td>₱${totalVal}</td>
            <td><span class="badge ${badgeClass}">${p.status.toUpperCase()}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderMetrics() {
    if (typeof DataManager === 'undefined') return;
    const stats = DataManager.getStockStatistics();
    
    const statTotalProducts = document.getElementById('statTotalProducts');
    const statTotalValue = document.getElementById('statTotalValue');
    const statLowStock = document.getElementById('statLowStock');
    const statOutOfStock = document.getElementById('statOutOfStock');

    if (statTotalProducts) statTotalProducts.textContent = stats.totalProducts;
    if (statTotalValue) statTotalValue.textContent = `₱${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (statLowStock) statLowStock.textContent = stats.lowStockCount;
    if (statOutOfStock) statOutOfStock.textContent = stats.outOfStockCount;
}

function renderAlerts() {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer || typeof DataManager === 'undefined') return;

    const lowStockItems = DataManager.getLowStockProducts ? DataManager.getLowStockProducts() : [];
    alertContainer.innerHTML = '';

    if (lowStockItems.length > 0) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-warning alert-dismissible fade show border-0 shadow-sm d-flex align-items-center mb-4';
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            <i class="fa-solid fa-triangle-exclamation fs-4 me-3 text-warning"></i>
            <div>
                <strong>Attention Required!</strong> There are <strong>${lowStockItems.length}</strong> products at or below reorder levels (${lowStockItems.map(i => i.name).join(', ')}).
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        alertContainer.appendChild(alertDiv);
    }
}

function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="highlight-text">$1</mark>');
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutLink = document.getElementById('logoutLink');
    const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');

    function performLogout(e) {
        if (e) e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }

    if (logoutBtn) logoutBtn.addEventListener('click', performLogout);
    if (logoutLink) logoutLink.addEventListener('click', performLogout);
    if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', performLogout);
}