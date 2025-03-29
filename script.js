console.log("✅ script.js 已成功載入！");

document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 DOM 已完全載入！");

    const signinBtn = document.getElementById("signinBtn");
    const nameInput = document.getElementById("nameInput");
    const dateInput = document.getElementById("dateInput");
    const messageDiv = document.getElementById("message");
    const leaderboardBody = document.querySelector("#leaderboard");

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

    signinBtn.addEventListener("click", () => {
        console.log("📌 簽到按鈕被點擊！");

        const name = nameInput.value.trim();
        const date = dateInput.value;

        if (!name || !date) {
            alert("請輸入名字並選擇日期！");
            return;
        }

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
            }).catch(error => console.error("❌ 資料儲存失敗：", error));
        }).catch(error => console.error("❌ 資料讀取失敗：", error));
    });

    console.log("✅ Firebase 連接檢查完成！");
});