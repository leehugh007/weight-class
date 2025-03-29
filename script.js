console.log("✅ script.js 已成功載入！");

document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 DOM 已完全載入！");

    const signinBtn = document.getElementById("signinBtn");
    const nameInput = document.getElementById("nameInput");
    const dateInput = document.getElementById("dateInput");
    const messageDiv = document.getElementById("message");
    const leaderboardTable = document.getElementById("leaderboard");
    const chartCtx = document.getElementById("chart").getContext("2d");

    const database = window.firebaseDatabase;

    if (!database) {
        console.error("❌ Firebase 資料庫初始化失敗！");
        alert("Firebase 資料庫初始化失敗！請確認你的設定！");
        return;
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = today;

    const encouragementMessages = [
        "做得好！繼續加油！💪",
        "每天都在進步！🏆",
        "你是最棒的！🚀",
        "保持這個好習慣！🔥",
        "簽到完成！堅持就是勝利！💯",
        "好棒！又是成功的一天！😄",
        "你正在變得更強！💥",
        "勇往直前！永不放棄！🔥",
        "健康從每一天開始！🍎",
        "Keep going! You're amazing! 🌟",
        "進步就在這一刻！📈",
        "堅持下去會有好結果！💖",
        "非常棒！今天又完成了！🎉",
        "你正在創造奇蹟！💎",
        "努力不會背叛你！💪"
    ];

    function getRandomMessage() {
        const index = Math.floor(Math.random() * encouragementMessages.length);
        return encouragementMessages[index];
    }

    signinBtn.addEventListener("click", () => {
        const name = nameInput.value.trim();
        const date = dateInput.value;

        if (!name || !date) {
            alert("請輸入名字並選擇日期！");
            return;
        }

        const userRef = database.ref(`users/${name}/${currentMonth}`);

        userRef.once('value').then(snapshot => {
            let data = snapshot.val() || { count: 0, dates: [] };

            if (!data.dates.includes(date)) {
                data.count++;
                data.dates.push(date);
            }

            return userRef.set(data);
        }).then(() => {
            const message = getRandomMessage();
            messageDiv.textContent = message;
            messageDiv.style.display = "block";
            updateLeaderboard();
            updateChart();
        }).catch(error => {
            console.error("❌ 資料處理失敗：", error);
        });
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
        });
    }

    function updateChart() {
        database.ref('users').once('value').then(snapshot => {
            const users = snapshot.val() || {};
            const dates = [];
            const counts = [];

            Object.keys(users).forEach(name => {
                const user = users[name][currentMonth];
                if (user && user.dates) {
                    user.dates.forEach(date => {
                        if (!dates.includes(date)) {
                            dates.push(date);
                            counts.push(1);
                        } else {
                            counts[dates.indexOf(date)]++;
                        }
                    });
                }
            });

            new Chart(chartCtx, {
                type: 'line',
                data: { 
                    labels: dates, 
                    datasets: [{
                        label: '簽到次數', 
                        data: counts, 
                        fill: false, 
                        borderColor: 'blue'
                    }]
                },
                options: { responsive: true }
            });
        });
    }

    updateLeaderboard();
    updateChart();
});