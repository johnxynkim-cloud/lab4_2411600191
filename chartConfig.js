const ChartManager = (function () {
    let categoryChartInstance = null;
    let statusChartInstance = null;
    let topProductsChartInstance = null;

    const brandColors = {
        primaryTeal: '#00A8A8',
        secondaryGreen: '#70C149',
        warningYellow: '#F59E0B',
        dangerRed: '#EF4444',
        accentMint: '#99F6E4',
        slateDark: '#334155'
    };

    function renderCategoryValueChart(summaryData) {
        const canvas = document.getElementById('categoryValueChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const labels = Object.keys(summaryData || {});
        const values = Object.values(summaryData || {});

        if (categoryChartInstance) {
            categoryChartInstance.data.labels = labels;
            categoryChartInstance.data.datasets[0].data = values;
            categoryChartInstance.update();
            return;
        }

        categoryChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Value (₱)',
                    data: values,
                    backgroundColor: [brandColors.primaryTeal, brandColors.secondaryGreen, '#3B82F6', '#8B5CF6'],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    function renderStockStatusChart(statusData) {
        const canvas = document.getElementById('stockStatusChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const data = statusData || { 'in stock': 0, 'low stock': 0, 'out of stock': 0 };
        const newValues = [data['in stock'] || 0, data['low stock'] || 0, data['out of stock'] || 0];

        if (statusChartInstance) {
            statusChartInstance.data.datasets[0].data = newValues;
            statusChartInstance.update();
            return;
        }

        statusChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['In Stock', 'Low Stock', 'Out of Stock'],
                datasets: [{
                    data: newValues,
                    backgroundColor: [brandColors.secondaryGreen, brandColors.warningYellow, brandColors.dangerRed]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    function renderTopProductsChart(topProducts) {
        const canvas = document.getElementById('topProductsChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const products = topProducts || [];
        const labels = products.map(p => p.name);
        const dataValues = products.map(p => p.price * p.quantity);

        if (topProductsChartInstance) {
            topProductsChartInstance.data.labels = labels;
            topProductsChartInstance.data.datasets[0].data = dataValues;
            topProductsChartInstance.update();
            return;
        }

        topProductsChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Inventory Value (₱)',
                    data: dataValues,
                    borderColor: brandColors.primaryTeal,
                    backgroundColor: 'rgba(0, 168, 168, 0.15)',
                    pointBackgroundColor: brandColors.primaryTeal,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    function updateAllCharts() {
        if (typeof DataManager !== 'undefined') {
            renderCategoryValueChart(DataManager.getCategorySummary());
            renderStockStatusChart(DataManager.getStockStatusDistribution());
            if (typeof DataManager.getTopProductsByValue === 'function') {
                renderTopProductsChart(DataManager.getTopProductsByValue());
            }
        }
    }

    return {
        renderCategoryValueChart,
        renderStockStatusChart,
        renderTopProductsChart,
        updateAllCharts
    };
})();