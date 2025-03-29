const signinBtn = document.getElementById("signinBtn");
const nameInput = document.getElementById("nameInput");
const leaderboardBody = document.querySelector("#leaderboard tbody");

let users = JSON.parse(localStorage.getItem("users")) || {};

function updateLeaderboard() {
    const sortedUsers = Object.entries(users).sort((a, b) => b[1] - a[1]);
    
    leaderboardBody.innerHTML = ""; // 清空排行榜表格內容

    sortedUsers.forEach(([name, count], index) => {
        const row = leaderboardBody.insertRow();
        row.innerHTML = `<td>${index + 1}</td><td>${name}</td><td>${count}</td>`;
    });
}

signinBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();

    if (!name) {
        alert("請輸入名字！");
        return;
    }

    if (users[name]) {
        users[name]++;
    } else {
        users[name] = 1;
    }

    localStorage.setItem("users", JSON.stringify(users));
    nameInput.value = "";
    updateLeaderboard();
});

// 網頁載入時自動更新排行榜
updateLeaderboard();