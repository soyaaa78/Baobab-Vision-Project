export const lineChartData = {
    labels: [ /* x axis */
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
    ],

    datasets: [ /* y axis/axes if marami */
        {
            label: 'Steps by Gio',
            data: [3000, 5000, 4500, 6000, 8000, 7000, 9000],
            borderColor: "rgb(192, 75, 75)",
        },
        {
            label: 'Steps by Margo',
            data: [3000, 5000, 5500, 8000, 1200, 11000, 15000],
            borderColor: "rgb(75, 192, 192)",
        }
    ]
};

export const barChartData = {
    labels: ["Rent", "Groceries", "Utilities", "Entertainment", "Transportation"],
    datasets: [
        {
            label: "Expenses",
            data: [1200, 300, 150, 180, 100],
            backgroundColor: ["rgba(255, 99, 132, 0.2)"],
            borderColor: ["rgba(54, 162, 235, 1)"],
            borderWidth: 1,
        }
    ]
};

export const pieChartData = {
    labels: ["Oval", "Round", "Rectangle", "Square", "Heart", "Diamond", "Triangle"],
    datasets: [
        {
            label: "Face Shape",
            data: [120, 60, 30, 90, 45, 33, 92], /* sample data only, replace w backend shit */
            backgroundColor: [
                "rgba(214, 59, 59, 0.9)",    // Strong Red
                "rgba(52, 152, 219, 0.9)",   // Vivid Blue
                "rgba(46, 204, 113, 0.9)",   // Fresh Green
                "rgba(241, 188, 15, 0.9)",   // Bright Yellow
                "rgba(155, 89, 182, 0.9)",   // Soft Purple
                "rgba(230, 126, 34, 0.9)",   // Bold Orange
                "rgba(26, 188, 156, 0.9)",   // Teal
            ],
            hoverOffset: 4,
        }
    ]

}