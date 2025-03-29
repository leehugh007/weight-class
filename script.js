console.log("✅ script.js 已成功載入！");

document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 DOMContentLoaded 事件觸發，HTML 已完全載入！");

    const signinBtn = document.getElementById("signinBtn");
    const nameInput = document.getElementById("nameInput");
    const dateInput = document.getElementById("dateInput");
    const messageDiv = document.getElementById("message");
    const leaderboardBody = document.querySelector("#leaderboard tbody");
    const chartCanvas = document.getElementById("chart");

    if (!signinBtn) {
        console.error("❌ 找不到 `signinBtn` 按鈕！");
        return;
    } else {
        console.log("✅ `signinBtn` 按鈕已正確找到！");
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    let users = JSON.parse(localStorage.getItem("users")) || {};

    const savedMessage = localStorage.getItem("lastMessage");
    if (savedMessage) {
        messageDiv.textContent = savedMessage;
        messageDiv.style.display = "block";
    }

    // 📅 確保日期欄位自動填入今天的日期
    function setTodayAsDefaultDate() {
        const today = new Date().toISOString().split("T")[0];
        if (!dateInput.value) {
            dateInput.value = today;
            console.log("📅 自動填入今天日期：", today);
        }
    }
    setTodayAsDefaultDate();

    function renderChart() {
        const name = nameInput.value.trim();
        if (!name || !users[name] || !users[name][currentMonth]) {
            console.log("📊 沒有找到該用戶或沒有簽到資料。");
            return;
        }

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

    function updateLeaderboard() {
        const sortedUsers = Object.entries(users).map(([name, data]) => {
            const currentData = data[currentMonth] || { count: 0, dates: [] };
            return [name, currentData];
        }).sort((a, b) => b[1].count - a[1].count);

        leaderboardBody.innerHTML = "";

        sortedUsers.forEach(([name, data], index) => {
            const row = leaderboardBody.insertRow();
            row.innerHTML = `<td>${index + 1}</td><td>${name}</td><td>${data.count}</td>`;
        });

        console.log("📊 排行榜已更新！");
    }

    // 🔥 確認 `click` 事件能否被觸發
    signinBtn.addEventListener("click", () => {
        console.log("✅ 簽到按鈕被按下！");

        const name = nameInput.value.trim();
        const date = dateInput.value;

        if (!name) {
            alert("請輸入名字！");
            console.error("❌ 沒有輸入名字！");
            return;
        }
        if (!date) {
            alert("請選擇日期！");
            console.error("❌ 沒有選擇日期！");
            return;
        }

        console.log("📌 簽到名稱：", name);
        console.log("📅 簽到日期：", date);

        if (!users[name]) users[name] = {};
        if (!users[name][currentMonth]) users[name][currentMonth] = { count: 0, dates: [] };

        if (!users[name][currentMonth].dates.includes(date)) {
            users[name][currentMonth].count++;
            users[name][currentMonth].dates.push(date);
            console.log(`✅ ${name} 的簽到資料已更新！`);
        } else {
            console.log(`🔁 ${name} 已經簽到過這一天：${date}`);
        }

        localStorage.setItem("users", JSON.stringify(users));
        
        const randomMessage = "簽到成功！繼續加油！💪";
        messageDiv.textContent = randomMessage;
        messageDiv.style.display = "block";
        localStorage.setItem("lastMessage", randomMessage);

        updateLeaderboard();
        renderChart();

        nameInput.value = "";
        setTodayAsDefaultDate();
    });

    updateLeaderboard();
    renderChart();
});