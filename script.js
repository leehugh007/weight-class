console.log("✅ script.js 已成功載入！");

document.addEventListener("DOMContentLoaded", () => {
    const signinBtn = document.getElementById("signinBtn");
    const nameInput = document.getElementById("nameInput");
    const dateInput = document.getElementById("dateInput");
    const messageDiv = document.getElementById("message");
    const leaderboardBody = document.querySelector("#leaderboard tbody");
    const chartCanvas = document.getElementById("chart");

    const currentMonth = new Date().toISOString().slice(0, 7);
    const database = window.firebaseDatabase;
    const { firebaseRef, firebaseSet, firebaseGet, firebaseChild } = window;

    function setTodayAsDefaultDate() {
        const today = new Date().toISOString().split("T")[0];
        dateInput.value = today;
    }
    setTodayAsDefaultDate();

    function updateLeaderboard() {
        const dbRef = firebaseRef(database, 'users');
        firebaseGet(dbRef).then((snapshot) => {
            if (snapshot.exists()) {
                const users = snapshot.val();
                leaderboardBody.innerHTML = "";

                const sortedUsers = Object.entries(users)
                    .map(([name, data]) => [name, data[currentMonth] || { count: 0 }])
                    .sort((a, b) => b[1].count - a[1].count);

                sortedUsers.forEach(([name, data], index) => {
                    const row = leaderboardBody.insertRow();
                    row.innerHTML = `<td>${index + 1}</td><td>${name}</td><td>${data.count || 0}</td>`;
                });
            }
        });
    }

    function renderChart(name) {
        const userRef = firebaseRef(database, `users/${name}/${currentMonth}/dates`);
        firebaseGet(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                const dates = snapshot.val() || [];
                const data = dates.reduce((acc, date) => {
                    acc[date] = (acc[date] || 0) + 1;
                    return acc;
                }, {});

                if (window.myChart) window.myChart.destroy();

                window.myChart = new Chart(chartCanvas, {
                    type: 'line',
                    data: {
                        labels: Object.keys(data),
                        datasets: [{
                            label: `${name} 的簽到趨勢`,
                            data: Object.values(data),
                            borderColor: 'blue',
                            backgroundColor: 'rgba(0, 123, 255, 0.2)',
                            fill: true,
                        }]
                    }
                });
            }
        });
    }

    signinBtn.addEventListener("click", () => {
        const name = nameInput.value.trim();
        const date = dateInput.value;

        if (!name || !date) {
            alert("請輸入名字並選擇日期！");
            return;
        }

        const userRef = firebaseRef(database, `users/${name}/${currentMonth}`);

        firebaseGet(userRef).then((snapshot) => {
            let data = snapshot.val() || { count: 0, dates: [] };

            if (!data.dates.includes(date)) {
                data.count++;
                data.dates.push(date);
            }

            firebaseSet(userRef, data).then(() => {
                localStorage.setItem("lastMessage", "簽到成功！繼續加油！💪");
                messageDiv.textContent = "簽到成功！繼續加油！💪";
                messageDiv.style.display = "block";

                updateLeaderboard();
                renderChart(name);

                nameInput.value = "";
                setTodayAsDefaultDate();
            });
        });
    });

    updateLeaderboard();
});