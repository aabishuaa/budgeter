/**
 * Utility Functions Module
 * Helper functions for formatting, calculations, and common operations
 */

/**
 * Currency symbols mapping
 */
const CURRENCY_SYMBOLS = {
    JMD: 'J$',
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$'
};

/**
 * Category icons mapping (using Lucide icon names)
 */
const CATEGORY_ICONS = {
    Housing: 'home',
    Food: 'utensils',
    Transport: 'car',
    Utilities: 'zap',
    Entertainment: 'tv',
    Healthcare: 'heart-pulse',
    Shopping: 'shopping-bag',
    Other: 'more-horizontal'
};

/**
 * Category colors (vibrant theme)
 */
const CATEGORY_COLORS = {
    Housing: '#2563eb',      // vibrant blue
    Food: '#10b981',         // vibrant green
    Transport: '#f59e0b',    // vibrant orange
    Utilities: '#8b5cf6',    // vibrant purple
    Entertainment: '#ec4899', // vibrant pink
    Healthcare: '#f43f5e',   // vibrant coral
    Shopping: '#14b8a6',     // vibrant teal
    Other: '#6366f1'         // vibrant indigo
};

/**
 * Format currency with symbol
 */
function formatCurrency(amount, currency = 'JMD') {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    const formatted = Math.abs(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return `${symbol}${formatted}`;
}

/**
 * Format date to readable string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

/**
 * Format date to relative time (e.g., "2 days ago")
 */
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Get month name from YYYY-MM format
 */
function getMonthName(monthString) {
    const [year, month] = monthString.split('-');
    const date = new Date(year, month - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

/**
 * Calculate percentage
 */
function calculatePercentage(part, whole) {
    if (whole === 0) return 0;
    return (part / whole) * 100;
}

/**
 * Get color for budget status
 */
function getBudgetStatusColor(spent, budget) {
    const percentage = calculatePercentage(spent, budget);
    if (percentage >= 100) return '#ff6b6b'; // red
    if (percentage >= 80) return '#ffa94d';  // orange
    if (percentage >= 60) return '#ffd43b';  // yellow
    return '#51cf66'; // green
}

/**
 * Truncate text with ellipsis
 */
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Generate CSV from expenses
 */
function generateExpensesCSV(expenses) {
    const headers = ['Date', 'Name', 'Category', 'Amount', 'Notes'];
    const rows = expenses.map(expense => [
        expense.date,
        `"${expense.name}"`,
        expense.category,
        expense.amount.toFixed(2),
        `"${expense.notes || ''}"`
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
}

/**
 * Download text as file
 */
function downloadFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Validate expense data
 */
function validateExpense(expense) {
    const errors = [];

    if (!expense.name || expense.name.trim().length === 0) {
        errors.push('Expense name is required');
    }

    if (!expense.category) {
        errors.push('Category is required');
    }

    if (!expense.amount || parseFloat(expense.amount) <= 0) {
        errors.push('Amount must be greater than 0');
    }

    if (!expense.date) {
        errors.push('Date is required');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Get icon HTML for a category
 */
function getCategoryIcon(category) {
    const iconName = CATEGORY_ICONS[category] || 'more-horizontal';
    return `<i data-lucide="${iconName}" class="category-icon"></i>`;
}

/**
 * Get color for a category
 */
function getCategoryColor(category) {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
}

/**
 * Sort expenses by different criteria
 */
function sortExpenses(expenses, criteria = 'date', order = 'desc') {
    const sorted = [...expenses];

    sorted.sort((a, b) => {
        let comparison = 0;

        switch (criteria) {
            case 'date':
                comparison = new Date(a.date) - new Date(b.date);
                break;
            case 'amount':
                comparison = a.amount - b.amount;
                break;
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            case 'category':
                comparison = a.category.localeCompare(b.category);
                break;
        }

        return order === 'desc' ? -comparison : comparison;
    });

    return sorted;
}

/**
 * Filter expenses by search term
 */
function filterExpenses(expenses, searchTerm) {
    if (!searchTerm || searchTerm.trim().length === 0) {
        return expenses;
    }

    const term = searchTerm.toLowerCase();
    return expenses.filter(expense =>
        expense.name.toLowerCase().includes(term) ||
        expense.category.toLowerCase().includes(term) ||
        (expense.notes && expense.notes.toLowerCase().includes(term))
    );
}

/**
 * Get spending insights
 */
function getSpendingInsights(expenses, income, budgets) {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = income - total;
    const savingsRate = income > 0 ? (remaining / income) * 100 : 0;

    // Find highest spending category
    const byCategory = {};
    expenses.forEach(exp => {
        byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount;
    });

    const highestCategory = Object.entries(byCategory)
        .sort(([, a], [, b]) => b - a)[0];

    // Count over-budget categories
    const overBudget = Object.entries(byCategory)
        .filter(([cat, spent]) => spent > (budgets[cat] || 0))
        .length;

    return {
        totalSpent: total,
        remaining: remaining,
        savingsRate: savingsRate,
        highestCategory: highestCategory ? highestCategory[0] : null,
        highestCategoryAmount: highestCategory ? highestCategory[1] : 0,
        overBudgetCount: overBudget,
        averageExpense: expenses.length > 0 ? total / expenses.length : 0,
        expenseCount: expenses.length
    };
}

/**
 * Get days remaining in current month
 */
function getDaysRemainingInMonth() {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return lastDay.getDate() - now.getDate();
}

/**
 * Calculate daily budget remaining
 */
function getDailyBudgetRemaining(remaining) {
    const daysLeft = getDaysRemainingInMonth();
    if (daysLeft <= 0) return 0;
    return remaining / daysLeft;
}
