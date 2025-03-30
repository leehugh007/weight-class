console.log("✅ script.js 已成功載入！");

function init() {
  console.log("📌 初始化簽到系統");

  const signinBtn = document.getElementById("signinBtn");
  const nameInput = document.getElementById("nameInput");
  const dateInput = document.getElementById("dateInput");
  const messageDiv = document.getElementById("message");
  const chartCanvas = document.getElementById("chart");
  const leaderboardTable = document.getElementById("leaderboardTable");
  const database = window.firebaseDatabase;

  if (!database) {
    console.error("❌ Firebase 資料庫未初始化！");
    return;
  }

  const ctx = chartCanvas.getContext("2d");
  let currentMonth = new Date().toISOString().slice(0, 7);

  function showConfetti() {
    console.log("🎉 播放彩帶動畫");
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 }
    });

    messageDiv.innerHTML = `🎊 恭喜達標！你已累積簽到 ${currentMonth} 🎯`;
    messageDiv.style.display = "block";
    setTimeout(() => (messageDiv.style.display = "none"), 5000);
  }

  function updateChartAndLeaderboard() {
    console.log("📊 取得排行榜資料...");
    database.ref("users").once("value").then(snapshot => {
      const users = snapshot.val();
      if (!users) {
        leaderboardTable.innerHTML = "<tr><td colspan='3'>尚無簽到資料</td></tr>";
        return;
      }

      const data = [];
      for (const name in users) {
        const monthData = users[name][currentMonth];
        if (monthData && monthData.count) {
          data.push({ name, count: monthData.count });
        }
      }

      if (data.length === 0) {
        leaderboardTable.innerHTML = "<tr><td colspan='3'>尚無當月簽到紀錄</td></tr>";
        return;
      }

      // 排序
      data.sort((a, b) => b.count - a.count);
      const labels = data.map(d => d.name);
      const counts = data.map(d => d.count);

      // 圖表
      if (window.signChart) window.signChart.destroy();
      window.signChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: "簽到次數",
            data: counts,
            backgroundColor: "rgba(54, 162, 235, 0.6)"
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true
        }
      });

      // 排行榜表格
      leaderboardTable.innerHTML = `
        <tr><th>名次</th><th>姓名</th><th>次數</th></tr>
        ${data.map((d, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${d.name}</td>
            <td>${d.count}</td>
          </tr>`).join("")}
      `;
    });
  }

  // ✅ 綁定簽到按鈕
  signinBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const date = dateInput.value;
    if (!name || !date) return alert("請輸入名字與日期");

    const ref = database.ref(`users/${name}/${currentMonth}`);
    ref.once("value").then(snapshot => {
      let data = snapshot.val() || { count: 0, dates: [] };
      if (!data.dates.includes(date)) {
        data.count++;
        data.dates.push(date);
      }
      return ref.set(data).then(() => data.count);
    }).then(count => {
      console.log(`📌 使用者 ${name} 簽到成功，第 ${count} 次`);
      if (count % 10 === 0) {
        showConfetti();
      } else {
        messageDiv.textContent = "簽到成功！繼續努力！💪";
        messageDiv.style.display = "block";
        setTimeout(() => (messageDiv.style.display = "none"), 3000);
      }
      updateChartAndLeaderboard();
    });
  });

  updateChartAndLeaderboard(); // 首次進入時載入
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}