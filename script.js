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
    if (savedMessage) {
        messageDiv.textContent = savedMessage;
        messageDiv.style.display = "block";
    }

    function setTodayAsDefaultDate() {
        const today = new Date().toISOString().split("T")[0];
        dateInput.value = today;
    }
    setTodayAsDefaultDate();

    function updateLeaderboard() {
        leaderboardBody.innerHTML = "";
        const sortedUsers = Object.entries(users)
            .map(([name, data]) => [name, data[currentMonth] || { count: 0 }])
            .sort((a, b) => b[1].count - a[1].count);

        sortedUsers.forEach(([name, data], index) => {
            const row = leaderboardBody.insertRow();
            row.innerHTML = `<td>${index + 1}</td><td>${name}</td><td>${data.count}</td>`;
        });
    }

    function renderChart() {
        const name = nameInput.value.trim();
        if (!name || !users[name] || !users[name][currentMonth]) return;

        const dates = users[name][currentMonth].dates || [];
        const data = dates.reduce((acc, date) => (acc[date] = (acc[date] || 0) + 1, acc), {});
        
        if (window.myChart) window.myChart.destroy();

        window.myChart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: Object.keys(data),
                datasets: [{
                    label: `${name} 的簽到趨勢`,
                    data: Object.values(data),
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
        localStorage.setItem("lastMessage", "簽到成功！繼續加油！💪");

        messageDiv.textContent = "簽到成功！繼續加油！💪";
        messageDiv.style.display = "block";
        
        updateLeaderboard();
        renderChart();

        nameInput.value = "";
        setTodayAsDefaultDate();
    });

    updateLeaderboard();
});