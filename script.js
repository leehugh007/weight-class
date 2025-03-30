console.log("✅ script.js 已成功載入！");

function init() {
  const signinBtn = document.getElementById("signinBtn");
  const nameInput = document.getElementById("nameInput");
  const dateInput = document.getElementById("dateInput");
  const messageDiv = document.getElementById("message");
  const chartCanvas = document.getElementById("chart");
  const leaderboardTable = document.getElementById("leaderboardTable");
  const database = window.firebaseDatabase;
  const ctx = chartCanvas.getContext("2d");
  const currentMonth = new Date().toISOString().slice(0, 7);

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
    const i = Math.floor(Math.random() * encouragementMessages.length);
    return encouragementMessages[i];
  }

  function showConfetti() {
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 }
    });
  }

  function updateChartAndLeaderboard() {
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

      data.sort((a, b) => b.count - a.count);
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

  // 🧠 自動帶入使用者名稱
  const savedName = localStorage.getItem("savedName");
  if (savedName) nameInput.value = savedName;

  signinBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const date = dateInput.value;

    if (!name || !date) {
      alert("請輸入名字與日期！");
      return;
    }

    localStorage.setItem("savedName", name);

    const ref = database.ref(`users/${name}/${currentMonth}`);
    ref.once("value").then(snapshot => {
      let data = snapshot.val() || { count: 0, dates: [] };
      if (!data.dates.includes(date)) {
        data.count++;
        data.dates.push(date);
      }

      return ref.set(data).then(() => {
        // ✅ 每次成功簽到都播放拉炮 + 顯示鼓勵語
        showConfetti();
        messageDiv.textContent = getRandomEncouragement();
        messageDiv.style.display = "block";
        setTimeout(() => messageDiv.style.display = "none", 4000);

        updateChartAndLeaderboard();
      });
    }).catch(error => {
      console.error("❌ 資料寫入錯誤：", error);
      alert("儲存失敗，請稍後再試！");
    });
  });

  updateChartAndLeaderboard();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}