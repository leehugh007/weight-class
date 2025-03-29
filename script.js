console.log("✅ script.js 已成功載入！");

function init() {
  console.log("📌 初始化簽到系統");

  const signinBtn = document.getElementById("signinBtn");
  const nameInput = document.getElementById("nameInput");
  const dateInput = document.getElementById("dateInput");
  const messageDiv = document.getElementById("message");
  const chartCanvas = document.getElementById("chart");  // 確認是否正確取得 <canvas>

  if (!signinBtn) {
    console.error("❌ 找不到 `signinBtn`，請檢查 HTML");
    return;
  }
  
  if (!chartCanvas) {
    console.error("❌ 找不到 `chart` 元素，請確認 HTML 是否有 `<canvas id='chart'></canvas>`");
    return;
  }

  const chartCtx = chartCanvas.getContext("2d");

  const database = window.firebaseDatabase;
  if (!database) {
    console.error("❌ Firebase 資料庫無法連線！");
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

      // 如果已經存在圖表，先銷毀它
      if (window.leaderboardChart) {
        window.leaderboardChart.destroy();
      }

      console.log("📊 準備繪製圖表資料：", { names, counts });

      // 繪製排行榜的橫條圖
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
          responsive: true,
          indexAxis: 'y',  // 讓橫條圖橫向顯示
          scales: {
            x: { beginAtZero: true }
          }
        }
      });

      console.log("✅ 排行榜圖表已成功更新！");
    }).catch(error => console.error("❌ 排行榜資料讀取失敗：", error));
  }

  updateLeaderboardChart();

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
        messageDiv.textContent = getRandomMessage();
        messageDiv.style.display = "block";
        updateLeaderboardChart();
      })
      .catch(error => {
        console.error("❌ 資料處理失敗：", error);
        alert("簽到失敗，請稍後再試！");
      });
  });
}

// 若 DOM 尚未載入則綁定 DOMContentLoaded，否則直接初始化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}