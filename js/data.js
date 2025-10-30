/**
 * Data Management Module
 * Handles localStorage operations and data structure
 */

const DATA_KEY = 'whereTheMoneyGoes_data';
const MONTHLY_INCOME_JMD = 160000;

// Default app state
const defaultState = {
    currency: 'JMD',
    monthlyIncome: MONTHLY_INCOME_JMD,
    expenses: [],
    budgets: {
        Housing: 50000,
        Food: 30000,
        Transport: 20000,
        Utilities: 15000,
        Entertainment: 10000,
        Healthcare: 10000,
        Shopping: 15000,
        Other: 20000
    },
    currentMonth: getCurrentMonth()
};

/**
 * Get current month in YYYY-MM format
 */
function getCurrentMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
}

/**
 * Load data from localStorage
 */
function loadData() {
    try {
        const savedData = localStorage.getItem(DATA_KEY);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            return { ...defaultState, ...parsed, currentMonth: getCurrentMonth() };
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
    return { ...defaultState };
}

/**
 * Save data to localStorage
 */
function saveData(data) {
    try {
        localStorage.setItem(DATA_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        return false;
    }
}

/**
 * Add a new expense
 */
function addExpense(state, expense) {
    const newExpense = {
        id: Date.now(),
        name: expense.name,
        category: expense.category,
        amount: parseFloat(expense.amount),
        date: expense.date,
        notes: expense.notes || '',
        createdAt: new Date().toISOString()
    };

    state.expenses.push(newExpense);
    return state;
}

/**
 * Delete an expense by ID
 */
function deleteExpense(state, id) {
    state.expenses = state.expenses.filter(expense => expense.id !== id);
    return state;
}

/**
 * Update an expense
 */
function updateExpense(state, id, updates) {
    const index = state.expenses.findIndex(expense => expense.id === id);
    if (index !== -1) {
        state.expenses[index] = { ...state.expenses[index], ...updates };
    }
    return state;
}

/**
 * Get expenses for a specific month
 */
function getExpensesForMonth(state, month) {
    const [year, monthNum] = month.split('-').map(Number);
    return state.expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getFullYear() === year &&
               (expenseDate.getMonth() + 1) === monthNum;
    });
}

/**
 * Get total expenses for a specific month
 */
function getTotalExpenses(state, month) {
    const expenses = getExpensesForMonth(state, month);
    return expenses.reduce((total, expense) => total + expense.amount, 0);
}

/**
 * Get expenses by category for a specific month
 */
function getExpensesByCategory(state, month) {
    const expenses = getExpensesForMonth(state, month);
    const byCategory = {};

    expenses.forEach(expense => {
        if (!byCategory[expense.category]) {
            byCategory[expense.category] = {
                total: 0,
                count: 0,
                expenses: []
            };
        }
        byCategory[expense.category].total += expense.amount;
        byCategory[expense.category].count++;
        byCategory[expense.category].expenses.push(expense);
    });

    return byCategory;
}

/**
 * Get spending trend for last N months
 */
function getSpendingTrend(state, months = 6) {
    const trend = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const monthKey = `${year}-${month}`;

        const total = getTotalExpenses(state, monthKey);
        trend.push({
            month: monthKey,
            label: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
            total: total
        });
    }

    return trend;
}

/**
 * Update budget for a category
 */
function updateBudget(state, category, amount) {
    state.budgets[category] = parseFloat(amount);
    return state;
}

/**
 * Export data as JSON
 */
function exportData(state) {
    return JSON.stringify(state, null, 2);
}

/**
 * Import data from JSON
 */
function importData(jsonString) {
    try {
        const imported = JSON.parse(jsonString);
        return { ...defaultState, ...imported };
    } catch (error) {
        console.error('Error importing data:', error);
        return null;
    }
}

/**
 * Clear all expenses for a specific month
 */
function clearMonthExpenses(state, month) {
    const [year, monthNum] = month.split('-').map(Number);
    state.expenses = state.expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return !(expenseDate.getFullYear() === year &&
                (expenseDate.getMonth() + 1) === monthNum);
    });
    return state;
}
