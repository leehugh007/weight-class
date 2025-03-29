console.log("✅ script.js 已成功載入！");

function init() {
  console.log("📌 初始化簽到系統");

  const signinBtn = document.getElementById("signinBtn");
  const nameInput = document.getElementById("nameInput");
  const dateInput = document.getElementById("dateInput");
  const messageDiv = document.getElementById("message");
  const chartCanvas = document.getElementById("chart");
  const leaderboardTable = document.getElementById("leaderboardTable");

  if (!signinBtn || !chartCanvas || !leaderboardTable) {
    console.error("❌ 找不到必要的 HTML 元素，請確認 `index.html` 是否正確配置。");
    return;
  }

  const chartCtx = chartCanvas.getContext("2d");
  const database = window.firebaseDatabase;
  const currentMonth = new Date().toISOString().slice(0, 7);

  if (!database) {
    console.error("❌ Firebase 資料庫無法連線！");
    return;
  }

  const encouragementMessages = [
    "做得好！繼續加油！💪", "每天都在進步！🏆", "你是最棒的！🚀",
    "保持這個好習慣！🔥", "簽到完成！堅持就是勝利！💯",
    "好棒！又是成功的一天！😄", "你正在變得更強！💥",
    "勇往直前！永不放棄！🔥", "健康從每一天開始！🍎"
  ];

  function getRandomMessage() {
    return encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
  }

  function updateLeaderboardChart() {
    console.log("📌 正在更新排行榜圖表...");
    database.ref('users').once('value').then(snapshot => {
      const users = snapshot.val() || {};
      const leaderboard = [];

      Object.keys(users).forEach(name => {
        const user = users[name][currentMonth];
        if (user) leaderboard.push({ name, count: user.count });
      });

      leaderboard.sort((a, b) => b.count - a.count);

      if (leaderboard.length === 0) {
        console.log("⚠️ 沒有資料可顯示在排行榜中。");
        return;
      }

      const names = leaderboard.map(user => user.name);
      const counts = leaderboard.map(user => user.count);

      if (window.leaderboardChart) window.leaderboardChart.destroy();

      window.leaderboardChart = new Chart(chartCtx, {
        type: 'bar',
        data: {
          labels: names,
          datasets: [{
            label: '簽到次數排名',
            data: counts,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          scales: { x: { beginAtZero: true } }
        }
      });

      leaderboardTable.innerHTML = `
        <tr><th>排名</th><th>名字</th><th>簽到次數</th></tr>
        ${leaderboard.map((user, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${user.name}</td>
            <td>${user.count}</td>
          </tr>`).join('')}
      `;
    }).catch(error => console.error("❌ 排行榜資料讀取失敗：", error));
  }

  updateLeaderboardChart();

  signinBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const date = dateInput.value;
    if (!name || !date) return alert("請輸入名字並選擇日期！");

    const userRef = database.ref(`users/${name}/${currentMonth}`);

    userRef.once('value').then(snapshot => {
      let data = snapshot.val() || { count: 0, dates: [] };
      if (!data.dates.includes(date)) {
        data.count++;
        data.dates.push(date);
      }
      return userRef.set(data);
    }).then(() => {
      messageDiv.textContent = getRandomMessage();
      messageDiv.style.display = "block";
      updateLeaderboardChart();
    }).catch(error => alert("❌ 簽到失敗：" + error.message));
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}