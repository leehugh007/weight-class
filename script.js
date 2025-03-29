console.log("✅ script.js 已成功載入！");

document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 DOM 已完全載入！");

    const signinBtn = document.getElementById("signinBtn");
    const nameInput = document.getElementById("nameInput");
    const dateInput = document.getElementById("dateInput");
    const messageDiv = document.getElementById("message");
    const leaderboardBody = document.querySelector("#leaderboard");
    const monthSelect = document.getElementById("monthSelect");

    const database = window.firebaseDatabase;
    const { firebaseRef, firebaseSet, firebaseGet, firebaseChild } = window;

    if (!database) {
        console.error("❌ Firebase 資料庫初始化失敗！");
        alert("Firebase 資料庫初始化失敗！請確認你的設定！");
        return;
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = today;

    function updateLeaderboard(month) {
        console.log("📌 正在更新排行榜...");
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

                console.log("✅ 排行榜更新成功！");
            } else {
                console.log("⚠️ 沒有資料。");
            }
        }).catch(error => console.error("❌ 資料庫讀取失敗：", error));
    }

    signinBtn.addEventListener("click", () => {
        console.log("📌 簽到按鈕被點擊！");

        const name = nameInput.value.trim();
        const date = dateInput.value;

        if (!name || !date) {
            alert("請輸入名字並選擇日期！");
            console.error("❌ 名字或日期未輸入！");
            return;
        }

        const userRef = firebaseRef(database, `users/${name}/${currentMonth}`);
        firebaseGet(userRef).then(snapshot => {
            let data = snapshot.val() || { count: 0, dates: [] };
            console.log("📌 取得的資料：", data);

            if (!data.dates.includes(date)) {
                data.count++;
                data.dates.push(date);
            }

            firebaseSet(userRef, data).then(() => {
                console.log("✅ 資料成功儲存到 Firebase！");
                messageDiv.textContent = "簽到成功！繼續加油！💪";
                messageDiv.style.display = "block";
                setTimeout(() => messageDiv.style.display = "none", 3000);
                updateLeaderboard(currentMonth);
            }).catch(error => console.error("❌ 資料儲存失敗：", error));
        }).catch(error => console.error("❌ 資料讀取失敗：", error));
    });

    updateLeaderboard(currentMonth);
});