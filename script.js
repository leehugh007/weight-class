console.log("✅ script.js 已成功載入！");

function init() {
  console.log("📌 初始化簽到系統");

  const signinBtn = document.getElementById("signinBtn");
  const nameInput = document.getElementById("nameInput");
  const dateInput = document.getElementById("dateInput");
  const messageDiv = document.getElementById("message");
  const chartCanvas = document.getElementById("chart");
  const leaderboardTable = document.getElementById("leaderboardTable");
  const monthSelect = document.getElementById("monthSelect");

  const chartCtx = chartCanvas.getContext("2d");
  const database = window.firebaseDatabase;

  if (!database) {
    console.error("❌ Firebase 資料庫無法連線！");
    return;
  }

  let currentMonth = new Date().toISOString().slice(0, 7);
  monthSelect.value = currentMonth;

  function updateMonthOptions() {
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
        .toISOString()
        .slice(0, 7);
      const option = document.createElement("option");
      option.value = month;
      option.textContent = month;
      monthSelect.appendChild(option);
    }
  }

  function updateLeaderboardChart() {
    database.ref('users').once('value').then(snapshot => {
      const users = snapshot.val() || {};
      const leaderboard = [];

      Object.keys(users).forEach(name => {
        const user = users[name][currentMonth];
        if (user) leaderboard.push({ name, count: user.count });
      });

      leaderboard.sort((a, b) => b.count - a.count);

      if (window.leaderboardChart) window.leaderboardChart.destroy();

      window.leaderboardChart = new Chart(chartCtx, {
        type: 'bar',
        data: {
          labels: leaderboard.map(user => user.name),
          datasets: [{
            label: '簽到次數排名',
            data: leaderboard.map(user => user.count),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: { indexAxis: 'y', responsive: true }
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
    });
  }

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
    }).then(updateLeaderboardChart);
  });

  monthSelect.addEventListener("change", () => {
    currentMonth = monthSelect.value;
    updateLeaderboardChart();
  });

  updateMonthOptions();
  updateLeaderboardChart();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}