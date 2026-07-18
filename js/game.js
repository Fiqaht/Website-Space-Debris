$(function () {
    // 1. SETUP
    const c = document.getElementById("gameCanvas"), x = c.getContext("2d");
    const q = s => $(s), load = s => Object.assign(new Image(), { src: "images/" + s });
    const img = {
        ball: load("energy_ball.png.png"), paddle: load("paddle_satelite.png.png"),
        green: load("debris_green.png.png"), greenBreak: load("debris_green_break.png.png"),
        red: load("debris_red.png.png"), redBreak: load("debris_red_break.png.png")
    };
    const p = { x: 0, y: c.height - 60, w: 150, h: 42, speed: 14 };
    const b = { x: 0, y: 0, w: 34, h: 34, dx: 7, dy: -7 };
    let blocks = [], score = 0, high = 0, lives = 3;
    let run = false, end = false, left = false, right = false;

    // 2. CREATE BLOCKS
    function makeBlocks() {
        blocks = [];
        const w = 130, h = 43, gap = 14, start = (c.width - (6 * w + 5 * gap)) / 2;
        for (let r = 0; r < 4; r++) for (let col = 0; col < 6; col++) {
            const red = r % 2 === 1;
            blocks.push({
                x: start + col * (w + gap), y: 35 + r * (h + gap),
                w, h, red, point: red ? 20 : 10, broken: false, show: true
            });
        }
    }

    // 3. RESET AND INFO
    function resetPosition() {
        p.x = c.width / 2 - p.w / 2;
        b.x = c.width / 2 - b.w / 2; b.y = c.height - 110;
        b.dx = Math.random() > .5 ? 7 : -7; b.dy = -7;
    }
    function message(title, text) {
        q("#messageTitle").text(title); q("#messageText").text(text); q("#messageBox").show();
    }
    function info() {
        q("#score").text(score); q("#highScore").text(high); q("#lives").empty();
        for (let i = 1; i <= 3; i++) {
            const heart = i <= lives ? "Shape_Heart_Red.png" : "Shape_Heart_White.png";
            q("#lives").append(`<img src="images/${heart}" class="life-heart" alt="Life">`);
        }
    }
    function reset() {
        score = 0; lives = 3; run = false; end = false;
        makeBlocks(); resetPosition(); info();
        q("#startBtn").text("Start");
        message("Ready for Mission?", "Click Start or press Space.");
    }
    function toggle() {
        if (run) {
            run = false; q("#startBtn").text("Continue");
            message("Game Stopped", "Click Continue to resume.");
        } else {
            if (end) reset();
            run = true; q("#startBtn").text("Stop"); q("#messageBox").hide();
        }
    }

    // 4. COLLISION
    function hit(o) {
        return b.x + b.w >= o.x && b.x <= o.x + o.w &&
               b.y + b.h >= o.y && b.y <= o.y + o.h;
    }
    function breakBlock(o) {
        o.broken = true; b.dy *= -1;
        score += o.point; high = Math.max(high, score); info();
        setTimeout(() => {
            o.show = false;
            if (blocks.every(v => !v.show)) {
                run = false; end = true; q("#startBtn").text("Play Again");
                message("Mission Accomplished!", "All debris cleared.");
            }
        }, 150);
    }
    function loseLife() {
        lives--; run = false; info();
        if (!lives) {
            end = true; q("#startBtn").text("Play Again");
            message("Try Again!", "No lives remaining.");
        } else {
            resetPosition(); q("#startBtn").text("Continue");
            message("Try Again!", "You lost one life.");
        }
    }

    // 5. UPDATE
    function update() {
        if (!run) return;
        p.x += left ? -p.speed : right ? p.speed : 0;
        p.x = Math.max(0, Math.min(c.width - p.w, p.x));
        b.x += b.dx; b.y += b.dy;

        if (b.x <= 0 || b.x + b.w >= c.width) b.dx *= -1;
        if (b.y <= 0) b.dy = Math.abs(b.dy);
        if (b.dy > 0 && hit(p)) {
            b.dy = -Math.abs(b.dy);
            b.y = p.y - b.h;
        }
        for (const o of blocks)
            if (o.show && !o.broken && hit(o)) {
                breakBlock(o);
                break;
            }
        if (b.y > c.height) loseLife();
    }

    // 6. DRAW
    function draw() {
        x.clearRect(0, 0, c.width, c.height);
        blocks.forEach(o => {
            if (!o.show) return;
            const normal = o.red ? img.red : img.green;
            const broken = o.red ? img.redBreak : img.greenBreak;
            x.drawImage(o.broken ? broken : normal, o.x, o.y, o.w, o.h);
        });
        x.drawImage(img.paddle, p.x, p.y, p.w, p.h);
        x.drawImage(img.ball, b.x, b.y, b.w, b.h);
    }

    // 7. CONTROLS
    function hold(id, set) {
        q(id).on("pointerdown", () => set(true))
             .on("pointerup pointerleave pointercancel", () => set(false));
    }
    q("#startBtn").click(toggle); q("#resetBtn").click(reset);
    q("#saveNameBtn").click(() =>
        q("#playerName").text(q("#nameInput").val().trim() || "Player"));
    hold("#leftBtn", v => left = v); hold("#rightBtn", v => right = v);

    $(document).keydown(e => {
        if (e.key === "ArrowLeft") left = true;
        if (e.key === "ArrowRight") right = true;
        if (e.code === "Space" && !e.repeat) toggle();
        if (e.key.includes("Arrow") || e.code === "Space") e.preventDefault();
    }).keyup(e => {
        if (e.key === "ArrowLeft") left = false;
        if (e.key === "ArrowRight") right = false;
    });

    // 8. LOOP - 30 FPS
    setInterval(() => { update(); draw(); }, 1000 / 30);
    reset();
});