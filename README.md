# Where the Money Goes 💰

A beautiful, streamlined money tracking application built with vanilla JavaScript, featuring a modern pastel design and powerful expense tracking capabilities.

## Features

### Core Functionality
- **Expense Tracking**: Add, view, and delete expenses with detailed information
- **Budget Management**: Set and monitor budgets for 8 different categories
- **Smart Insights**: Get real-time insights on your spending habits
- **Search & Filter**: Quickly find expenses with search and multiple sorting options
- **Data Export**: Export your expenses to CSV for external analysis

### Visualizations
- **Category Breakdown**: Pie chart showing spending distribution across categories
- **Spending Trends**: 6-month line chart tracking your spending over time
- **Budget vs Actual**: Compare your budgets against actual spending

### User Experience
- **Modern Pastel Design**: Beautiful, calming color scheme
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Real-time Updates**: See changes instantly as you add or remove expenses
- **Local Storage**: All data saved locally in your browser
- **Bible Verse**: Matthew 6:33 displayed at the top for spiritual guidance

## Technical Details

### Built With
- **HTML5**: Semantic markup
- **CSS3**: Custom properties, Grid, Flexbox
- **Vanilla JavaScript**: No frameworks, pure ES6+
- **Chart.js**: Beautiful, responsive charts
- **Lucide Icons**: Clean, modern icon set

### Project Structure
```
budgeter/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── favicon.svg         # Browser icon
├── js/
│   ├── data.js        # Data management & localStorage
│   ├── utils.js       # Helper functions
│   ├── charts.js      # Chart rendering
│   └── app.js         # Main application logic
└── README.md          # Documentation
```

### Categories
- Housing
- Food
- Transport
- Utilities
- Entertainment
- Healthcare
- Shopping
- Other

### Monthly Income
Built-in monthly income: **J$160,000 JMD**

## Usage

### Adding an Expense
1. Fill in the expense name
2. Select a category
3. Enter the amount in JMD
4. Choose the date
5. Optionally add notes
6. Click "Add Expense"

### Viewing Insights
- **Savings Rate**: Percentage of income saved
- **Top Category**: Your highest spending category
- **Over Budget**: Number of categories exceeding budget
- **Average Expense**: Mean expense amount

### Searching & Sorting
- Use the search box to filter expenses by name, category, or notes
- Sort by date, amount, or name in ascending/descending order

### Exporting Data
Click the "Export CSV" button to download your expenses as a CSV file for use in Excel, Google Sheets, or other tools.

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

Requires JavaScript enabled and localStorage support.

## Data Privacy

All data is stored locally in your browser using localStorage. No data is sent to any server. Your financial information stays completely private on your device.

## Future Enhancements

Potential features for future versions:
- Multiple currency support
- Recurring expenses
- Budget alerts and notifications
- Data backup and restore
- Monthly/yearly comparisons
- Custom categories
- Receipt photo attachments
- Multi-device sync

## License

This project is open source and available for personal use.

## Credits

Developed with care to help you track where your money goes.

"But seek first his kingdom and his righteousness, and all these things will be given to you as well." - Matthew 6:33
