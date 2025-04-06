
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

const playerImage = new Image();
playerImage.src = "assets/images/kyros.png";

const euLogo = new Image();
euLogo.src = "assets/images/eu.png";

const natoLogo = new Image();
natoLogo.src = "assets/images/nato.png";

const logos = []; // Toplanabilir objeler
let player = { x: 150, y: 550, width: 40, height: 40, speed: 5 };
let score = 0;
let playsLeft = 5;
let rewardGiven = false;

const dailyLimitKey = "kyros_jump_daily_plays";
const scoreKey = "kyros_jump_total_score";

function loadDailyPlays() {
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem(dailyLimitKey)) || {};
    if (saved.date !== today) {
        saved.date = today;
        saved.plays = 5;
        localStorage.setItem(dailyLimitKey, JSON.stringify(saved));
    }
    playsLeft = saved.plays;
    document.getElementById("plays-left").textContent = playsLeft;
}

function updatePlays() {
    const saved = JSON.parse(localStorage.getItem(dailyLimitKey));
    saved.plays -= 1;
    playsLeft = saved.plays;
    localStorage.setItem(dailyLimitKey, JSON.stringify(saved));
    document.getElementById("plays-left").textContent = playsLeft;
}

function loadTotalScore() {
    score = parseInt(localStorage.getItem(scoreKey)) || 0;
    document.getElementById("score").textContent = score;
}

function saveScore() {
    localStorage.setItem(scoreKey, score);
}

function spawnLogo() {
    const x = Math.random() * (canvas.width - 30);
    const y = -30;
    const type = Math.random() < 0.5 ? "EU" : "NATO";
    logos.push({ x, y, width: 30, height: 30, type });
}

function drawLogos() {
    logos.forEach(logo => {
        const img = logo.type === "EU" ? euLogo : natoLogo;
        ctx.drawImage(img, logo.x, logo.y, logo.width, logo.height);
    });
}

function moveLogos() {
    logos.forEach(logo => logo.y += 2);
}

function checkCollision(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x &&
           a.y < b.y + b.height && a.y + a.height > b.y;
}

function collectLogos() {
    for (let i = logos.length - 1; i >= 0; i--) {
        if (checkCollision(player, logos[i])) {
            logos.splice(i, 1);
            score += 5;
            document.getElementById("score").textContent = score;
            saveScore();
            checkRewards();
        }
    }
}

function checkRewards() {
    if (!rewardGiven && [20, 30, 40, 50].includes(score)) {
        document.getElementById("reward-code").textContent = "Reward Code: KYROS" + score;
        document.getElementById("reward-message").classList.remove("hidden");
        rewardGiven = true;
    }
}

function closeReward() {
    document.getElementById("reward-message").classList.add("hidden");
}

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") player.x -= player.speed;
    if (e.key === "ArrowRight") player.x += player.speed;
});

function drawPlayer() {
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

function gameLoop() {
    if (playsLeft <= 0) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.fillText("No plays left today!", 60, canvas.height / 2);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawLogos();
    moveLogos();
    collectLogos();

    requestAnimationFrame(gameLoop);
}

loadDailyPlays();
loadTotalScore();
updatePlays();
setInterval(spawnLogo, 2000);
gameLoop();
