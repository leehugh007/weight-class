console.log("✅ script.js 已成功載入！");

document.addEventListener("DOMContentLoaded", () => {
    const signinBtn = document.getElementById("signinBtn");
    const nameInput = document.getElementById("nameInput");
    const dateInput = document.getElementById("dateInput");
    const messageDiv = document.getElementById("message");
    const leaderboardBody = document.querySelector("#leaderboard tbody");
    const chartCanvas = document.getElementById("chart");

    const currentMonth = new Date().toISOString().slice(0, 7);
    let users = JSON.parse(localStorage.getItem("users")) || {};

    const savedMessage = localStorage.getItem("lastMessage");
    if (savedMessage) messageDiv.textContent = savedMessage;

    if (!dateInput.value) dateInput.placeholder = "選擇日期 (YYYY-MM-DD)";  

    function renderChart() {
        const name = nameInput.value.trim();
        if (!name || !users[name] || !users[name][currentMonth]) return;

        const dates = users[name][currentMonth].dates;
        const data = dates.reduce((acc, date) => {
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        const chartLabels = Object.keys(data);
        const chartData = Object.values(data);

        if (window.myChart) window.myChart.destroy();

        window.myChart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: `${name} 的簽到趨勢`,
                    data: chartData,
                    borderColor: 'blue',
                    backgroundColor: 'rgba(0, 123, 255, 0.2)',
                    fill: true,
                }]
            }
        });
    }

    signinBtn.addEventListener("click", () => {
        const name = nameInput.value.trim();
        const date = dateInput.value;

        if (!name || !date) return;

        if (!users[name]) users[name] = {};
        if (!users[name][currentMonth]) users[name][currentMonth] = { count: 0, dates: [] };

        if (!users[name][currentMonth].dates.includes(date)) {
            users[name][currentMonth].count++;
            users[name][currentMonth].dates.push(date);
        }

        localStorage.setItem("users", JSON.stringify(users));
        renderChart();
    });

    renderChart();
});