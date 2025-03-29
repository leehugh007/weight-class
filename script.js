console.log("✅ script.js 已成功載入！");

function init() {
  console.log("📌 初始化簽到系統");

  const signinBtn = document.getElementById("signinBtn");
  const nameInput = document.getElementById("nameInput");
  const dateInput = document.getElementById("dateInput");
  const messageDiv = document.getElementById("message");

  if (!signinBtn) {
    console.error("❌ 找不到 `signinBtn`，請檢查 HTML");
    return;
  }

  signinBtn.addEventListener("click", () => {
    console.log("✅ 簽到按鈕已被點擊");

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

    // 取得當前月份 YYYY-MM 格式
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
