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

Object.keys(users).forEach(name => {
    if (typeof users[name] === "number") {
        users[name] = { count: users[name], dates: [] };
    }
});

localStorage.setItem("users", JSON.stringify(users));

function updateLeaderboard() {
    const sortedUsers = Object.entries(users).sort((a, b) => b[1].count - a[1].count);
    leaderboardBody.innerHTML = "";

    sortedUsers.forEach(([name, data], index) => {
        const row = leaderboardBody.insertRow();
        if (index === 0) row.classList.add("gold");
        if (index === 1) row.classList.add("silver");
        if (index === 2) row.classList.add("bronze");

        row.innerHTML = `<td>${index + 1}</td><td>${name}</td><td>${data.count}</td>`;
    });
}

function showMessage(message) {
    messageDiv.textContent = message;
    messageDiv.style.display = "block";
    setTimeout(() => { messageDiv.style.display = "none"; }, 3000);
}

function renderChart() {
    const name = nameInput.value.trim();
    if (!name || !users[name] || users[name].dates.length === 0) return;

    const labels = users[name].dates;

    // 計算每個日期出現的次數
    const data = labels.reduce((acc, date) => {
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    const chartLabels = Object.keys(data);
    const chartData = Object.values(data);

    // 清除之前的圖表 (防止重複繪製)
    if (window.myChart) {
        window.myChart.destroy();
    }

    // 繪製新的圖表
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
                tension: 0.2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true },
                tooltip: { enabled: true }
            },
            scales: {
                x: { title: { display: true, text: '日期' } },
                y: { title: { display: true, text: '簽到次數' } }
            }
        }
    });
}

signinBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const date = dateInput.value;

    if (!name) { alert("請輸入名字！"); return; }
    if (!date) { alert("請選擇日期！"); return; }

    if (!users[name]) { users[name] = { count: 0, dates: [] }; }
    if (!Array.isArray(users[name].dates)) { users[name].dates = []; }
    if (!users[name].dates.includes(date)) {
        users[name].count++;
        users[name].dates.push(date);
    }

    localStorage.setItem("users", JSON.stringify(users));
    nameInput.value = "";
    dateInput.value = "";

    const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
    showMessage(randomMessage);

    updateLeaderboard();
    renderChart();  // 確保圖表每次簽到後都會自動更新
});

// 網頁載入時自動更新排行榜
updateLeaderboard();