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

  let currentMonth = new Date().toISOString().slice(0, 7);
  const chartCtx = chartCanvas.getContext("2d");

  function showConfetti() {
    console.log("🎊 播放彩帶動畫！");
    confetti({
      particleCount: 150,
      spread: 120,
      origin: { y: 0.6 }
    });

    messageDiv.innerHTML = `
      🎉🎊 <strong>恭喜你！達成新的目標！🎯</strong><br>
      已累積簽到 ${currentMonth}，太棒了！🔥
    `;
    messageDiv.style.display = "block";
  }

  function updateChartAndTable() {
    database.ref("users").once("value").then(snapshot => {
      const users = snapshot.val() || {};
      const data = [];

      Object.keys(users).forEach(name => {
        const monthData = users[name][currentMonth];
        if (monthData) {
          data.push({ name, count: monthData.count });
        }
      });

      data.sort((a, b) => b.count - a.count);
      const labels = data.map(d => d.name);
      const counts = data.map(d => d.count);

      if (window.signinChart) window.signinChart.destroy();
      window.signinChart = new Chart(chartCtx, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: "簽到次數",
            data: counts,
            backgroundColor: "rgba(75,192,192,0.6)"
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true
        }
      });

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
      if (count % 10 === 0) {
        showConfetti();
      } else {
        messageDiv.textContent = "簽到成功！繼續加油！💪";
        messageDiv.style.display = "block";
      }
      updateChartAndTable();
    });
  });

  updateChartAndTable();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}