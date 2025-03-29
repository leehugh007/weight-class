console.log("✅ script.js 已成功載入！");

document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 DOM 已完全載入！");

    const signinBtn = document.getElementById("signinBtn");
    const nameInput = document.getElementById("nameInput");
    const dateInput = document.getElementById("dateInput");
    const messageDiv = document.getElementById("message");
    const leaderboardTable = document.getElementById("leaderboard");
    const chartCtx = document.getElementById("chart").getContext("2d");

    if (!signinBtn) {
        console.error("❌ 找不到 `signinBtn` 按鈕！");
        return;
    }

    console.log("✅ 確認按鈕元件已正確取得！");

    const database = window.firebaseDatabase;
    if (!database) {
        console.error("❌ 資料庫載入失敗！");
        return;
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    const encouragementMessages = [
        "做得好！繼續加油！💪", "每天都在進步！🏆", "你是最棒的！🚀",
        "保持這個好習慣！🔥", "簽到完成！堅持就是勝利！💯",
        "好棒！又是成功的一天！😄", "你正在變得更強！💥",
        "勇往直前！永不放棄！🔥", "健康從每一天開始！🍎"
    ];

    function getRandomMessage() {
        const index = Math.floor(Math.random() * encouragementMessages.length);
        return encouragementMessages[index];
    }

    signinBtn.addEventListener("click", () => {
        console.log("✅ 簽到按鈕成功觸發！");
        
        const name = nameInput.value.trim();
        const date = dateInput.value;

        if (!name || !date) {
            alert("請輸入名字並選擇日期！");
            return;
        }

        const userRef = database.ref(`users/${name}/${currentMonth}`);
        
        userRef.once('value')
            .then(snapshot => {
                let data = snapshot.val() || { count: 0, dates: [] };
                
                if (!data.dates.includes(date)) {
                    data.count++;
                    data.dates.push(date);
                }

                return userRef.set(data);
            })
            .then(() => {
                console.log("✅ 資料成功儲存到 Firebase！");
                messageDiv.textContent = getRandomMessage();
                messageDiv.style.display = "block";
                updateLeaderboard();
                updateChart();
            })
            .catch(error => console.error("❌ 資料寫入失敗：", error));
    });

    function updateLeaderboard() {
        database.ref('users').once('value').then(snapshot => {
            const users = snapshot.val() || {};
            const leaderboard = [];

            Object.keys(users).forEach(name => {
                const user = users[name][currentMonth];
                if (user) leaderboard.push({ name, count: user.count });
            });

            leaderboard.sort((a, b) => b.count - a.count);

            leaderboardTable.innerHTML = leaderboard.map((user, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${user.name}</td>
                    <td>${user.count}</td>
                </tr>
            `).join('');
        }).catch(error => console.error("❌ 排行榜資料讀取失敗：", error));
    }

    function updateChart() {
        database.ref('users').once('value').then(snapshot => {
            const users = snapshot.val() || {};
            const dates = [];
            const counts = {};

            Object.keys(users).forEach(name => {
                const user = users[name][currentMonth];
                if (user && user.dates) {
                    user.dates.forEach(date => {
                        counts[date] = (counts[date] || 0) + 1;
                        if (!dates.includes(date)) dates.push(date);
                    });
                }
            });

            dates.sort();

            const chartData = dates.map(date => counts[date]);

            new Chart(chartCtx, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: '簽到次數',
                        data: chartData,
                        borderColor: 'blue',
                        fill: false
                    }]
                },
                options: {
                    responsive: true
                }
            });

            console.log("✅ 趨勢圖表成功更新！");
        }).catch(error => console.error("❌ 圖表資料讀取失敗：", error));
    }

    updateLeaderboard();
    updateChart();
});