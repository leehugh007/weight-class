console.log("✅ script.js 已成功載入！");

function init() {
  console.log("📌 初始化簽到系統");

  const signinBtn = document.getElementById("signinBtn");
  const nameInput = document.getElementById("nameInput");
  const dateInput = document.getElementById("dateInput");
  const messageDiv = document.getElementById("message");
  const leaderboardTable = document.getElementById("leaderboard");
  const chartCtx = document.getElementById("chart").getContext("2d");

  if (!signinBtn) {
    console.error("❌ 找不到 `signinBtn`，請檢查 HTML");
    return;
  }

  const database = window.firebaseDatabase;
  if (!database) {
    console.error("❌ Firebase 資料庫無法連線！");
    return;
  }

  const currentMonth = new Date().toISOString().slice(0, 7);

  signinBtn.addEventListener("click", () => {
    console.log("✅ 簽到按鈕已被點擊");

    const name = nameInput.value.trim();
    const date = dateInput.value;
    if (!name || !date) {
      alert("請輸入名字並選擇日期！");
      return;
    }
    console.log(`📌 簽到資料：名字 = ${name}, 日期 = ${date}`);

    const userRef = database.ref(`users/${name}/${currentMonth}`);
    userRef.once('value')
      .then(snapshot => {
        let data = snapshot.val() || { count: 0, dates: [] };
        console.log("📌 取得的資料快照：", data);
        if (!data.dates.includes(date)) {
          data.count++;
          data.dates.push(date);
        }
        console.log("📌 準備寫入資料：", data);
        return userRef.set(data);
      })
      .then(() => {
        console.log("✅ 資料成功儲存到 Firebase！");
        messageDiv.textContent = "簽到成功！繼續加油！💪";
        messageDiv.style.display = "block";
        updateLeaderboard();
        updateChart();
      })
      .catch(error => {
        console.error("❌ 資料處理失敗：", error);
        alert("簽到失敗，請稍後再試！");
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

      console.log("✅ 排行榜已成功更新！");
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
        options: { responsive: true }
      });

      console.log("✅ 趨勢圖表成功更新！");
    }).catch(error => console.error("❌ 圖表資料讀取失敗：", error));
  }

  // 啟動時自動更新排行榜與圖表
  updateLeaderboard();
  updateChart();
}

// 若 DOM 尚未載入則綁定 DOMContentLoaded，否則直接初始化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}