console.log("✅ script.js 已成功載入！");

document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 DOM 已完全載入！");

    const signinBtn = document.getElementById("signinBtn");
    const nameInput = document.getElementById("nameInput");
    const dateInput = document.getElementById("dateInput");
    const messageDiv = document.getElementById("message");

    console.log("📌 確認按鈕元件：", signinBtn);

    if (!signinBtn) {
        console.error("❌ 找不到 `signinBtn`，檢查你的 HTML 檔案。");
        return;
    }

    // 檢查按鈕是否能觸發事件
    signinBtn.addEventListener("click", () => {
        console.log("✅ 簽到按鈕成功綁定並觸發！");

        const name = nameInput.value.trim();
        const date = dateInput.value;

        if (!name || !date) {
            alert("請輸入名字並選擇日期！");
            return;
        }

        console.log(`📌 簽到資料：名字 = ${name}, 日期 = ${date}`);

        const database = window.firebaseDatabase;

        if (!database) {
            console.error("❌ Firebase 資料庫無法連線！");
            return;
        }

        const currentMonth = new Date().toISOString().slice(0, 7);
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
                messageDiv.textContent = "簽到成功！繼續加油！💪";
                messageDiv.style.display = "block";
            })
            .catch(error => console.error("❌ 資料處理失敗：", error));
    });
});