/**
 * Main Application Module
 * Handles application initialization, UI updates, and user interactions
 */

let appState = null;
let searchTerm = '';
let sortCriteria = 'date';
let sortOrder = 'desc';

/**
 * Initialize the application
 */
function initApp() {
    // Load data
    appState = loadData();

    // Initialize charts
    initCharts();

    // Set up event listeners
    setupEventListeners();

    // Initial render
    renderApp();

    // Auto-save every 30 seconds
    setInterval(() => {
        if (appState) {
            saveData(appState);
        }
    }, 30000);
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Expense form submission
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
        expenseForm.addEventListener('submit', handleAddExpense);
    }

    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    // Sort controls
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSortChange);
    }

    // Export CSV button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExportCSV);
    }

    // Quick expense buttons
    document.querySelectorAll('.quick-expense-btn').forEach(btn => {
        btn.addEventListener('click', handleQuickExpense);
    });

    // Budget edit buttons
    document.querySelectorAll('.edit-budget-btn').forEach(btn => {
        btn.addEventListener('click', handleEditBudget);
    });
}

/**
 * Handle adding a new expense
 */
function handleAddExpense(e) {
    e.preventDefault();

    const form = e.target;
    const expense = {
        name: form.expenseName.value.trim(),
        category: form.expenseCategory.value,
        amount: form.expenseAmount.value,
        date: form.expenseDate.value,
        notes: form.expenseNotes?.value?.trim() || ''
    };

    // Validate
    const validation = validateExpense(expense);
    if (!validation.isValid) {
        showNotification(validation.errors.join(', '), 'error');
        return;
    }

    // Add expense
    appState = addExpense(appState, expense);
    saveData(appState);

    // Reset form
    form.reset();
    form.expenseDate.valueAsDate = new Date();

    // Show notification
    showNotification('Expense added successfully!', 'success');

    // Re-render
    renderApp();
}

/**
 * Handle deleting an expense
 */
function handleDeleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) {
        return;
    }

    appState = deleteExpense(appState, id);
    saveData(appState);
    showNotification('Expense deleted', 'success');
    renderApp();
}

/**
 * Handle search
 */
function handleSearch(e) {
    searchTerm = e.target.value;
    renderExpenseList();
}

/**
 * Handle sort change
 */
function handleSortChange(e) {
    const [criteria, order] = e.target.value.split('-');
    sortCriteria = criteria;
    sortOrder = order;
    renderExpenseList();
}

/**
 * Handle quick expense
 */
function handleQuickExpense(e) {
    const category = e.target.dataset.category;
    const form = document.getElementById('expenseForm');
    if (form && category) {
        form.expenseCategory.value = category;
        form.expenseName.focus();
    }
}

/**
 * Handle budget editing
 */
function handleEditBudget(e) {
    const category = e.target.dataset.category;
    const currentBudget = appState.budgets[category] || 0;

    const newBudget = prompt(
        `Enter new budget for ${category}:`,
        currentBudget.toString()
    );

    if (newBudget !== null && !isNaN(newBudget) && parseFloat(newBudget) >= 0) {
        appState = updateBudget(appState, category, newBudget);
        saveData(appState);
        showNotification('Budget updated', 'success');
        renderApp();
    }
}

/**
 * Handle CSV export
 */
function handleExportCSV() {
    const monthExpenses = getExpensesForMonth(appState, appState.currentMonth);

    if (monthExpenses.length === 0) {
        showNotification('No expenses to export', 'warning');
        return;
    }

    const csv = generateExpensesCSV(monthExpenses);
    const filename = `expenses-${appState.currentMonth}.csv`;
    downloadFile(csv, filename, 'text/csv');
    showNotification('Expenses exported successfully', 'success');
}

/**
 * Main render function
 */
function renderApp() {
    renderSummary();
    renderInsights();
    renderExpenseList();
    renderBudgetOverview();
    updateAllCharts(appState);

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Render summary section
 */
function renderSummary() {
    const monthExpenses = getExpensesForMonth(appState, appState.currentMonth);
    const totalSpent = getTotalExpenses(appState, appState.currentMonth);
    const remaining = MONTHLY_INCOME_JMD - totalSpent;
    const percentSpent = calculatePercentage(totalSpent, MONTHLY_INCOME_JMD);

    const summaryEl = document.getElementById('summary');
    if (!summaryEl) return;

    summaryEl.innerHTML = `
        <div class="summary-grid">
            <div class="summary-card income-card">
                <div class="summary-icon">
                    <i data-lucide="wallet"></i>
                </div>
                <div class="summary-content">
                    <div class="summary-label">Monthly Income</div>
                    <div class="summary-value">${formatCurrency(MONTHLY_INCOME_JMD, 'JMD')}</div>
                </div>
            </div>

            <div class="summary-card spent-card">
                <div class="summary-icon">
                    <i data-lucide="trending-down"></i>
                </div>
                <div class="summary-content">
                    <div class="summary-label">Total Spent</div>
                    <div class="summary-value">${formatCurrency(totalSpent, 'JMD')}</div>
                    <div class="summary-meta">${percentSpent.toFixed(1)}% of income</div>
                </div>
            </div>

            <div class="summary-card remaining-card">
                <div class="summary-icon">
                    <i data-lucide="piggy-bank"></i>
                </div>
                <div class="summary-content">
                    <div class="summary-label">Remaining</div>
                    <div class="summary-value ${remaining < 0 ? 'negative' : ''}">${formatCurrency(remaining, 'JMD')}</div>
                    <div class="summary-meta">${getDaysRemainingInMonth()} days left</div>
                </div>
            </div>

            <div class="summary-card daily-card">
                <div class="summary-icon">
                    <i data-lucide="calendar-days"></i>
                </div>
                <div class="summary-content">
                    <div class="summary-label">Daily Budget</div>
                    <div class="summary-value">${formatCurrency(getDailyBudgetRemaining(remaining), 'JMD')}</div>
                    <div class="summary-meta">Per day remaining</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render insights section
 */
function renderInsights() {
    const monthExpenses = getExpensesForMonth(appState, appState.currentMonth);
    const insights = getSpendingInsights(
        monthExpenses,
        MONTHLY_INCOME_JMD,
        appState.budgets
    );

    const insightsEl = document.getElementById('insights');
    if (!insightsEl) return;

    let insightsHTML = '<div class="insights-grid">';

    // Savings rate insight
    const savingsColor = insights.savingsRate >= 20 ? 'success' :
                        insights.savingsRate >= 10 ? 'warning' : 'danger';
    insightsHTML += `
        <div class="insight-card ${savingsColor}">
            <i data-lucide="percent"></i>
            <div class="insight-content">
                <div class="insight-value">${insights.savingsRate.toFixed(1)}%</div>
                <div class="insight-label">Savings Rate</div>
            </div>
        </div>
    `;

    // Highest category
    if (insights.highestCategory) {
        insightsHTML += `
            <div class="insight-card">
                ${getCategoryIcon(insights.highestCategory)}
                <div class="insight-content">
                    <div class="insight-value">${formatCurrency(insights.highestCategoryAmount, 'JMD')}</div>
                    <div class="insight-label">Top: ${insights.highestCategory}</div>
                </div>
            </div>
        `;
    }

    // Over budget count
    if (insights.overBudgetCount > 0) {
        insightsHTML += `
            <div class="insight-card danger">
                <i data-lucide="alert-triangle"></i>
                <div class="insight-content">
                    <div class="insight-value">${insights.overBudgetCount}</div>
                    <div class="insight-label">Over Budget</div>
                </div>
            </div>
        `;
    }

    // Average expense
    insightsHTML += `
        <div class="insight-card">
            <i data-lucide="calculator"></i>
            <div class="insight-content">
                <div class="insight-value">${formatCurrency(insights.averageExpense, 'JMD')}</div>
                <div class="insight-label">Avg Expense (${insights.expenseCount} total)</div>
            </div>
        </div>
    `;

    insightsHTML += '</div>';
    insightsEl.innerHTML = insightsHTML;
}

/**
 * Render expense list
 */
function renderExpenseList() {
    let monthExpenses = getExpensesForMonth(appState, appState.currentMonth);

    // Apply search filter
    monthExpenses = filterExpenses(monthExpenses, searchTerm);

    // Apply sort
    monthExpenses = sortExpenses(monthExpenses, sortCriteria, sortOrder);

    const listEl = document.getElementById('expenseList');
    if (!listEl) return;

    if (monthExpenses.length === 0) {
        listEl.innerHTML = `
            <div class="empty-state">
                <i data-lucide="inbox"></i>
                <p>${searchTerm ? 'No expenses found' : 'No expenses yet'}</p>
                <p class="empty-state-sub">${searchTerm ? 'Try a different search term' : 'Add your first expense to get started'}</p>
            </div>
        `;
        return;
    }

    let html = '<div class="expense-items">';
    monthExpenses.forEach(expense => {
        html += `
            <div class="expense-item" style="border-left: 4px solid ${getCategoryColor(expense.category)}">
                <div class="expense-main">
                    <div class="expense-header">
                        <div class="expense-name">${expense.name}</div>
                        <div class="expense-amount">${formatCurrency(expense.amount, 'JMD')}</div>
                    </div>
                    <div class="expense-meta">
                        <span class="expense-category">
                            ${getCategoryIcon(expense.category)}
                            ${expense.category}
                        </span>
                        <span class="expense-date">
                            <i data-lucide="calendar"></i>
                            ${formatDate(expense.date)}
                        </span>
                    </div>
                    ${expense.notes ? `<div class="expense-notes">${expense.notes}</div>` : ''}
                </div>
                <div class="expense-actions">
                    <button class="btn-icon" onclick="handleDeleteExpense(${expense.id})" title="Delete">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    });
    html += '</div>';

    listEl.innerHTML = html;
}

/**
 * Render budget overview
 */
function renderBudgetOverview() {
    const expensesByCategory = getExpensesByCategory(appState, appState.currentMonth);
    const budgetEl = document.getElementById('budgetOverview');
    if (!budgetEl) return;

    let html = '<div class="budget-items">';

    Object.entries(appState.budgets).forEach(([category, budget]) => {
        const spent = expensesByCategory[category]?.total || 0;
        const remaining = budget - spent;
        const percentage = calculatePercentage(spent, budget);
        const statusColor = getBudgetStatusColor(spent, budget);

        html += `
            <div class="budget-item">
                <div class="budget-header">
                    <div class="budget-category">
                        ${getCategoryIcon(category)}
                        <span>${category}</span>
                    </div>
                    <div class="budget-amounts">
                        <span class="budget-spent">${formatCurrency(spent, 'JMD')}</span>
                        <span class="budget-total">/ ${formatCurrency(budget, 'JMD')}</span>
                    </div>
                </div>
                <div class="budget-progress">
                    <div class="budget-progress-bar">
                        <div class="budget-progress-fill" style="width: ${Math.min(percentage, 100)}%; background-color: ${statusColor}"></div>
                    </div>
                    <div class="budget-percentage">${percentage.toFixed(0)}%</div>
                </div>
                <div class="budget-remaining" style="color: ${remaining >= 0 ? '#51cf66' : '#ff6b6b'}">
                    ${remaining >= 0 ? formatCurrency(remaining, 'JMD') + ' left' : 'Over by ' + formatCurrency(Math.abs(remaining), 'JMD')}
                </div>
            </div>
        `;
    });

    html += '</div>';
    budgetEl.innerHTML = html;
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info'}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Initialize icon
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Initialize app when DOM is ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
