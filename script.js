console.log("✅ script.js 已成功載入！");

const signinBtn = document.getElementById("signinBtn");
const nameInput = document.getElementById("nameInput");
const dateInput = document.getElementById("dateInput");
const messageDiv = document.getElementById("message");
const leaderboardBody = document.querySelector("#leaderboard tbody");
const chartCanvas = document.getElementById("chart");

const encouragementMessages = [
    "做得好！繼續加油！💪",
    "你真棒！堅持下去！🔥",
    "每一天都是進步！📈",
    "持之以恆是成功的關鍵！💯",
    "不放棄，你就會成功！🏆",
    "超棒的！你正在變得更健康！🍎",
    "今天的努力會成為明天的成就！✨",
    "繼續保持這個好習慣！😄",
    "你正在為更好的自己努力！👏",
    "加油！你離目標又近了一步！🚀"
];

let users = JSON.parse(localStorage.getItem("users")) || {};
const currentMonth = new Date().toISOString().slice(0, 7);

function updateLeaderboard() {
    const sortedUsers = Object.entries(users).map(([name, data]) => {
        const currentData = data[currentMonth] || { count: 0, dates: [] };
        return [name, currentData];
    }).sort((a, b) => b[1].count - a[1].count);

    leaderboardBody.innerHTML = "";

    sortedUsers.forEach(([name, data], index) => {
        const row = leaderboardBody.insertRow();
        if (index === 0) row.classList.add("gold");
        if (index === 1) row.classList.add("silver");
        if (index === 2) row.classList.add("bronze");

        row.innerHTML = `<td>${index + 1}</td><td>${name}</td><td>${data.count}</td>`;
    });
}

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

    if (window.myChart) {
        window.myChart.destroy();
    }

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
    nameInput.value = "";
    dateInput.value = "";

    showMessage(encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]);
    updateLeaderboard();
    renderChart();
});

updateLeaderboard();