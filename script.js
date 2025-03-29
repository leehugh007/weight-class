console.log("✅ script.js 已成功載入！");

document.addEventListener("DOMContentLoaded", () => {
    const signinBtn = document.getElementById("signinBtn");
    const nameInput = document.getElementById("nameInput");
    const dateInput = document.getElementById("dateInput");
    const messageDiv = document.getElementById("message");
    const leaderboardBody = document.querySelector("#leaderboard");
    const chartCanvas = document.getElementById("chart");
    const monthSelect = document.getElementById("monthSelect");

    const database = window.firebaseDatabase;
    const { firebaseRef, firebaseSet, firebaseGet, firebaseChild } = window;

    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);
    dateInput.value = today.toISOString().slice(0, 10);

    function updateLeaderboard(month) {
        const dbRef = firebaseRef(database, 'users');
        firebaseGet(dbRef).then(snapshot => {
            if (snapshot.exists()) {
                const users = snapshot.val();
                leaderboardBody.innerHTML = "";

                const sortedUsers = Object.entries(users)
                    .map(([name, data]) => [name, data[month] || { count: 0 }])
                    .sort((a, b) => b[1].count - a[1].count);

                sortedUsers.forEach(([name, data], index) => {
                    const row = leaderboardBody.insertRow();
                    row.innerHTML = `<td>${index + 1}</td><td>${name}</td><td>${data.count || 0}</td>`;
                });
            }
        });
    }

    function updateMonthSelect() {
        monthSelect.innerHTML = "";
        for (let year = 2023; year <= today.getFullYear(); year++) {
            for (let month = 1; month <= 12; month++) {
                const monthValue = `${year}-${String(month).padStart(2, "0")}`;
                const option = document.createElement("option");
                option.value = monthValue;
                option.textContent = monthValue;
                monthSelect.appendChild(option);
            }
        }
        monthSelect.value = currentMonth;
    }

    signinBtn.addEventListener("click", () => {
        const name = nameInput.value.trim();
        const date = dateInput.value;

        if (!name || !date) return;

        const userRef = firebaseRef(database, `users/${name}/${currentMonth}`);
        firebaseGet(userRef).then(snapshot => {
            let data = snapshot.val() || { count: 0, dates: [] };

            if (!data.dates.includes(date)) {
                data.count++;
                data.dates.push(date);
            }

            firebaseSet(userRef, data).then(() => {
                messageDiv.textContent = "簽到成功！繼續加油！💪";
                messageDiv.style.display = "block";
                setTimeout(() => messageDiv.style.display = "none", 3000);

                updateLeaderboard(currentMonth);
            });
        });
    });

    updateMonthSelect();
    updateLeaderboard(currentMonth);

    monthSelect.addEventListener("change", () => {
        updateLeaderboard(monthSelect.value);
    });
});