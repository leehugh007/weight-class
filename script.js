console.log("✅ script.js 已成功載入！");

const signinBtn = document.getElementById("signinBtn");
const nameInput = document.getElementById("nameInput");
const dateInput = document.getElementById("dateInput");
const messageDiv = document.getElementById("message");
const leaderboardBody = document.querySelector("#leaderboard tbody");

const encouragementMessages = [
    "做得好！繼續加油！💪",
    "你真棒！堅持下去！🔥",
    "每一天都是進步！📈",
    "持之以恆是成功的關鍵！💯",
    "不放棄，你就會成功！🏆",
    "超棒的！你正在變得更健康！🍎",
    "今天的努力會成為明天的成就！✨",
    "繼續保持這個好習慣！😄",
    "你正在為更好的自己努力！👏",
    "加油！你離目標又近了一步！🚀"
];

// 載入現有資料
let users = JSON.parse(localStorage.getItem("users")) || {};

function updateLeaderboard() {
    const sortedUsers = Object.entries(users).sort((a, b) => b[1].count - a[1].count);
    
    leaderboardBody.innerHTML = ""; // 清空排行榜表格內容

    sortedUsers.forEach(([name, data], index) => {
        const row = leaderboardBody.insertRow();
        row.innerHTML = `<td>${index + 1}</td><td>${name}</td><td>${data.count}</td>`;
    });
}

function showMessage(message) {
    messageDiv.textContent = message;
    messageDiv.style.display = "block";
    
    setTimeout(() => {
        messageDiv.style.display = "none";
    }, 3000); // 3秒後自動隱藏訊息
}

signinBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const date = dateInput.value;

    if (!name) {
        alert("請輸入名字！");
        return;
    }
    if (!date) {
        alert("請選擇日期！");
        return;
    }

    // 初始化使用者資料
    if (!users[name]) {
        users[name] = { count: 0, dates: [] };
    }

    // 如果這個日期還沒紀錄過，就加 1
    if (!users[name].dates.includes(date)) {
        users[name].count++;
        users[name].dates.push(date);
    }

    // 保存到 localStorage
    localStorage.setItem("users", JSON.stringify(users));
    nameInput.value = "";
    dateInput.value = "";

    // 顯示鼓勵訊息
    const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
    showMessage(randomMessage);

    // 更新排行榜
    updateLeaderboard();
});

// 網頁載入時自動更新排行榜
updateLeaderboard();