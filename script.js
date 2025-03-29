console.log("✅ script.js 已成功載入！");

function init() {
  console.log("📌 初始化簽到系統");

  const signinBtn = document.getElementById("signinBtn");
  const nameInput = document.getElementById("nameInput");
  const dateInput = document.getElementById("dateInput");
  const messageDiv = document.getElementById("message");
  const database = window.firebaseDatabase;
  let currentMonth = new Date().toISOString().slice(0, 7);

  if (!database) {
    console.error("❌ Firebase 資料庫無法連線！");
    return;
  }

  function showConfetti() {
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 }
    });

    messageDiv.innerHTML = `
      🎉🎊 <strong>恭喜你！達成新的目標！🎯</strong> 🎉🎊
      <br>繼續加油！保持這個好習慣！💪
    `;
    messageDiv.style.display = "block";

    setTimeout(() => {
      messageDiv.style.display = "none";
    }, 5000);
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
      return userRef.set(data).then(() => data.count);
    })
    .then(count => {
      if (count % 10 === 0) {  // 🎯 每累積 10 次觸發拉炮效果
        showConfetti();
      } else {
        messageDiv.textContent = "簽到成功！繼續加油！💪";
        messageDiv.style.display = "block";
      }
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}