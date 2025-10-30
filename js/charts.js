/**
 * Charts Module
 * Handles all data visualization using Chart.js
 */

let categoryChartInstance = null;
let trendChartInstance = null;
let budgetChartInstance = null;

/**
 * Initialize all charts
 */
function initCharts() {
    // Chart.js global defaults
    if (typeof Chart !== 'undefined') {
        Chart.defaults.font.family = "'Space Grotesk', 'Segoe UI', sans-serif";
        Chart.defaults.color = '#475569';
    }
}

/**
 * Render category spending pie chart
 */
function renderCategoryChart(expenses, elementId = 'categoryChart') {
    const canvas = document.getElementById(elementId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destroy existing chart
    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }

    // Group expenses by category
    const byCategory = {};
    expenses.forEach(expense => {
        byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount;
    });

    const categories = Object.keys(byCategory);
    const amounts = Object.values(byCategory);
    const colors = categories.map(cat => getCategoryColor(cat));

    if (categories.length === 0) {
        // Show empty state
        ctx.font = '16px Space Grotesk, Segoe UI, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('No expenses yet', canvas.width / 2, canvas.height / 2);
        return;
    }

    categoryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: colors,
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        },
                        generateLabels: function(chart) {
                            const data = chart.data;
                            return data.labels.map((label, i) => {
                                const value = data.datasets[0].data[i];
                                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return {
                                    text: `${label} (${percentage}%)`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    hidden: false,
                                    index: i
                                };
                            });
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${formatCurrency(value, 'JMD')} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

/**
 * Render spending trend line chart
 */
function renderTrendChart(trendData, elementId = 'trendChart') {
    const canvas = document.getElementById(elementId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destroy existing chart
    if (trendChartInstance) {
        trendChartInstance.destroy();
    }

    const labels = trendData.map(item => item.label);
    const data = trendData.map(item => item.total);

    if (labels.length === 0) {
        ctx.font = '16px Space Grotesk, Segoe UI, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
        return;
    }

    trendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly Spending',
                data: data,
                borderColor: '#556B2F',
                backgroundColor: 'rgba(85, 107, 47, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: '#556B2F',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Spent: ${formatCurrency(context.raw, 'JMD')}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value, 'JMD');
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

/**
 * Render budget vs actual horizontal bar chart
 */
function renderBudgetChart(expensesByCategory, budgets, elementId = 'budgetChart') {
    const canvas = document.getElementById(elementId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destroy existing chart
    if (budgetChartInstance) {
        budgetChartInstance.destroy();
    }

    const categories = Object.keys(budgets);
    const budgetData = categories.map(cat => budgets[cat]);
    const spentData = categories.map(cat => expensesByCategory[cat]?.total || 0);
    const colors = categories.map(cat => getCategoryColor(cat));

    if (categories.length === 0) {
        ctx.font = '16px Space Grotesk, Segoe UI, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('No budget data', canvas.width / 2, canvas.height / 2);
        return;
    }

    budgetChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [
                {
                    label: 'Budget',
                    data: budgetData,
                    backgroundColor: 'rgba(200, 200, 200, 0.5)',
                    borderColor: 'rgba(150, 150, 150, 0.8)',
                    borderWidth: 1
                },
                {
                    label: 'Spent',
                    data: spentData,
                    backgroundColor: colors.map(c => c + 'dd'),
                    borderColor: colors,
                    borderWidth: 1
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatCurrency(context.raw, 'JMD')}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value, 'JMD');
                        }
                    }
                }
            }
        }
    });
}

/**
 * Destroy all chart instances
 */
function destroyAllCharts() {
    if (categoryChartInstance) {
        categoryChartInstance.destroy();
        categoryChartInstance = null;
    }
    if (trendChartInstance) {
        trendChartInstance.destroy();
        trendChartInstance = null;
    }
    if (budgetChartInstance) {
        budgetChartInstance.destroy();
        budgetChartInstance = null;
    }
}

/**
 * Update all charts with new data
 */
function updateAllCharts(state) {
    const monthExpenses = getExpensesForMonth(state, state.currentMonth);
    const expensesByCategory = getExpensesByCategory(state, state.currentMonth);
    const trendData = getSpendingTrend(state, 6);

    renderCategoryChart(monthExpenses);
    renderTrendChart(trendData);
    renderBudgetChart(expensesByCategory, state.budgets);
}
