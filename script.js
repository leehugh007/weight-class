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
  const currentMonth = new Date().toISOString().slice(0, 7);

  // 🎯 15 則鼓勵語
  const encouragementMessages = [
    "你今天也很棒！繼續保持！🔥",
    "堅持，是成功的秘密武器 💯",
    "再接再厲，你離目標更近一步了！🚀",
    "每天一小步，改變一大步 🏃‍♀️",
    "你值得為更好的自己努力！💪",
    "不放棄，就會有改變！🌟",
    "習慣正在改變你的人生 😊",
    "讚喔～今天也完成了挑戰 ✨",
    "這就是邁向成功的日常 🙌",
    "紀律會帶來自由，加油！🔥",
    "你正在超越昨天的自己 👊",
    "再困難，也擋不住你的決心 💥",
    "堅持下去，美好就在前方 🌈",
    "小小簽到，超大成就 🏆",
    "你值得為夢想多努力一天 💖"
  ];

  function getRandomEncouragement() {
    const index = Math.floor(Math.random() * encouragementMessages.length);
    return encouragementMessages[index];
  }

  function showConfetti() {
    console.log("🎉 播放彩帶動畫");
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 }
    });

    messageDiv.innerHTML = `🎊 恭喜達標！你已累積簽到 ${currentMonth} 🎯`;
    messageDiv.style.display = "block";
    setTimeout(() => messageDiv.style.display = "none", 5000);
  }

  function updateChartAndLeaderboard() {
    console.log("📊 讀取排行榜資料...");
    database.ref("users").once("value").then(snapshot => {
      const users = snapshot.val();
      if (!users) {
        leaderboardTable.innerHTML = "<tr><td colspan='3'>尚無簽到資料</td></tr>";
        return;
      }

      const data = [];
      for (const name in users) {
        const monthData = users[name][currentMonth];
        if (monthData && typeof monthData.count === "number") {
          data.push({ name, count: monthData.count });
        }
      }

      if (data.length === 0) {
        leaderboardTable.innerHTML = "<tr><td colspan='3'>本月尚無簽到記錄</td></tr>";
        return;
      }

      // 排序從大到小
      data.sort((a, b) => b.count - a.count);

      // 圖表
      const labels = data.map(d => d.name);
      const counts = data.map(d => d.count);

      if (window.signChart) window.signChart.destroy();
      window.signChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: "簽到次數",
            data: counts,
            backgroundColor: "rgba(75, 192, 192, 0.6)"
          }]
        },
        options: {
          indexAxis: "y",
          responsive: true,
        }
      });

      // 表格
      leaderboardTable.innerHTML = `
        <tr><th>名次</th><th>姓名</th><th>次數</th></tr>
        ${data.map((item, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${item.name}</td>
            <td>${item.count}</td>
          </tr>
        `).join("")}
      `;
    });
  }

  // ✅ 綁定簽到按鈕
  signinBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const date = dateInput.value;
    if (!name || !date) return alert("請輸入名字與日期！");

    const ref = database.ref(`users/${name}/${currentMonth}`);
    ref.once("value").then(snapshot => {
      let data = snapshot.val() || { count: 0, dates: [] };
      if (!data.dates.includes(date)) {
        data.count++;
        data.dates.push(date);
      }
      return ref.set(data).then(() => data.count);
    }).then(count => {
      console.log(`✅ ${name} 已簽到第 ${count} 次`);
      if (count % 10 === 0) {
        showConfetti();
      } else {
        messageDiv.textContent = getRandomEncouragement();
        messageDiv.style.display = "block";
        setTimeout(() => messageDiv.style.display = "none", 4000);
      }
      updateChartAndLeaderboard();
    });
  });

  updateChartAndLeaderboard();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}