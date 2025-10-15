/* Character Runner - uses assets/character.png as the player sprite if available.
   Controls: Arrow keys / WASD, on-screen buttons, mouse drag, touch drag.
*/
(function () {
  const cvs = document.getElementById('game');
  const ctx = cvs.getContext('2d');
  const W = cvs.width;
  const H = cvs.height;

  // UI
  const elScore = document.getElementById('score');
  const elBest = document.getElementById('best');
  const overlay = document.getElementById('overlay');
  const finalScore = document.getElementById('finalScore');
  const restartBtn = document.getElementById('restart');

  const btnLeft = document.getElementById('btn-left');
  const btnRight = document.getElementById('btn-right');
  const btnUp = document.getElementById('btn-up');
  const btnDown = document.getElementById('btn-down');

  const rand = (a, b) => Math.random() * (b - a) + a;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Player
  const playerImg = new Image();
  let imgLoaded = false;
  playerImg.onload = () => (imgLoaded = true);
  playerImg.onerror = () => (imgLoaded = false);
  playerImg.src = 'assets/character.png'; // drop your uploaded image here

  const player = {
    x: 120,
    y: H / 2,
    r: 22,
    vx: 0,
    vy: 0,
    speed: 0.28,
    maxSpeed: 5.2,
    thrust: 0.75,
    friction: 0.985,
    trail: [],
  };

  // Game state
  let obstacles = [];
  let particles = [];
  let running = false;
  let score = 0;
  let best = Number(localStorage.getItem('cr_best') || 0);
  elBest.textContent = best;

  // Input
  const keys = new Set();
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
      e.preventDefault();
    }
    keys.add(e.key.toLowerCase());
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

  // Buttons
  const press = (k) => keys.add(k);
  const release = (k) => keys.delete(k);
  btnLeft.addEventListener('pointerdown', () => press('arrowleft'));
  btnLeft.addEventListener('pointerup', () => release('arrowleft'));
  btnRight.addEventListener('pointerdown', () => press('arrowright'));
  btnRight.addEventListener('pointerup', () => release('arrowright'));
  btnUp.addEventListener('pointerdown', () => press('arrowup'));
  btnUp.addEventListener('pointerup', () => release('arrowup'));
  btnDown.addEventListener('pointerdown', () => press('arrowdown'));
  btnDown.addEventListener('pointerup', () => release('arrowdown'));

  // Drag movement
  let dragging = false;
  let lastPos = null;
  const getPos = (ev) => {
    const rect = cvs.getBoundingClientRect();
    const x = (ev.touches ? ev.touches[0].clientX : ev.clientX) - rect.left;
    const y = (ev.touches ? ev.touches[0].clientY : ev.clientY) - rect.top;
    return { x: (x / rect.width) * W, y: (y / rect.height) * H };
  };
  const startDrag = (ev) => { dragging = true; lastPos = getPos(ev); };
  const endDrag = () => { dragging = false; lastPos = null; };
  const moveDrag = (ev) => {
    if (!dragging) return;
    const p = getPos(ev);
    const dx = p.x - lastPos.x;
    const dy = p.y - lastPos.y;
    player.vx += clamp(dx * 0.05, -player.thrust, player.thrust);
    player.vy += clamp(dy * 0.05, -player.thrust, player.thrust);
    lastPos = p;
  };
  cvs.addEventListener('pointerdown', startDrag);
  cvs.addEventListener('pointerup', endDrag);
  cvs.addEventListener('pointerleave', endDrag);
  cvs.addEventListener('pointermove', moveDrag);
  cvs.addEventListener('touchstart', (e) => { startDrag(e); e.preventDefault(); }, { passive: false });
  cvs.addEventListener('touchend', (e) => { endDrag(); e.preventDefault(); });
  cvs.addEventListener('touchmove', (e) => { moveDrag(e); e.preventDefault(); }, { passive: false });

  function reset() {
    obstacles = [];
    particles = [];
    player.x = 140; player.y = H / 2; player.vx = 0; player.vy = 0;
    score = 0;
  }

  function spawnObstacle(dt, time) {
    // Increasing spawn rate & speed over time
    const base = 1100; // ms
    const freq = Math.max(300, base - time * 0.12);
    spawnObstacle.next = (spawnObstacle.next || 0) - dt;
    if (spawnObstacle.next <= 0) {
      spawnObstacle.next = freq;
      const h = rand(30, 120);
      const y = rand(20, H - 20 - h);
      const speed = 2.5 + Math.min(7, time * 0.002);
      const wobble = rand(0.6, 1.6);
      obstacles.push({ x: W + 40, y, w: rand(30, 55), h, vx: -speed, t: 0, wobble });
    }
  }

  function updatePlayer(dt) {
    const accel = player.speed * dt;
    if (keys.has('arrowleft') || keys.has('a')) player.vx -= accel;
    if (keys.has('arrowright') || keys.has('d')) player.vx += accel;
    if (keys.has('arrowup') || keys.has('w')) player.vy -= accel;
    if (keys.has('arrowdown') || keys.has('s')) player.vy += accel;

    player.vx = clamp(player.vx, -player.maxSpeed, player.maxSpeed);
    player.vy = clamp(player.vy, -player.maxSpeed, player.maxSpeed);

    player.x += player.vx;
    player.y += player.vy;

    // bounds
    player.x = clamp(player.x, player.r + 6, W - player.r - 6);
    player.y = clamp(player.y, player.r + 6, H - player.r - 6);

    // friction
    player.vx *= player.friction;
    player.vy *= player.friction;

    // trail
    player.trail.push({ x: player.x, y: player.y, r: player.r, life: 1 });
    if (player.trail.length > 24) player.trail.shift();
  }

  function updateObstacles(dt, t) {
    for (let o of obstacles) {
      o.t += dt;
      o.y += Math.sin((o.t / 180) * o.wobble) * 0.8;
      o.x += o.vx * dt * 0.06;
    }
    obstacles = obstacles.filter((o) => o.x + o.w > -20);
  }

  function collide() {
    for (let o of obstacles) {
      // circle-rect collision
      const cx = clamp(player.x, o.x, o.x + o.w);
      const cy = clamp(player.y, o.y, o.y + o.h);
      const dx = player.x - cx;
      const dy = player.y - cy;
      if (dx * dx + dy * dy < player.r * player.r) return true;
    }
    return false;
  }

  function burst(x, y, count = 40) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x, y,
        vx: rand(-3, 3), vy: rand(-3, 3),
        r: rand(1.5, 3.5),
        life: 1,
        hue: rand(180, 260)
      });
    }
  }

  function updateParticles(dt) {
    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.99; p.vy *= 0.99;
      p.life -= dt / 1200;
    }
    particles = particles.filter((p) => p.life > 0);
  }

  function drawBackground(t) {
    // Parallax starfield
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    for (let i = 0; i < 80; i++) {
      const x = (i * 73 + (t * 0.06)) % (W + 60) - 30;
      const y = (i * 97) % H;
      ctx.globalAlpha = 0.25 + ((i % 5) / 10);
      ctx.fillStyle = '#0ea5e9';
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.restore();
  }

  function drawTrail() {
    for (let i = 0; i < player.trail.length; i++) {
      const tr = player.trail[i];
      const a = i / player.trail.length;
      ctx.globalAlpha = a * 0.4;
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(tr.x, tr.y, tr.r * 0.65 * a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawPlayer() {
    if (imgLoaded) {
      ctx.save();
      const angle = Math.atan2(player.vy, player.vx) * 0.25;
      ctx.translate(player.x, player.y);
      ctx.rotate(angle);
      const size = player.r * 2.2;
      ctx.drawImage(playerImg, -size / 2, -size / 2, size, size);
      ctx.restore();
    } else {
      // fallback shape similar to a blob
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.fillStyle = '#e5e7eb';
      ctx.beginPath();
      ctx.moveTo(-18, -6);
      ctx.quadraticCurveTo(-6, -18, 10, -10);
      ctx.quadraticCurveTo(22, -4, 10, 6);
      ctx.quadraticCurveTo(-8, 6, -6, 18);
      ctx.quadraticCurveTo(-24, 14, -18, -6);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawObstacles() {
    ctx.fillStyle = '#f43f5e';
    for (let o of obstacles) {
      const r = 8;
      ctx.beginPath();
      ctx.moveTo(o.x + r, o.y);
      ctx.arcTo(o.x + o.w, o.y, o.x + o.w, o.y + r, r);
      ctx.arcTo(o.x + o.w, o.y + o.h, o.x + o.w - r, o.y + o.h, r);
      ctx.arcTo(o.x, o.y + o.h, o.x, o.y + o.h - r, r);
      ctx.arcTo(o.x, o.y, o.x + r, o.y, r);
      ctx.closePath();
      ctx.fill();

      // inner shine
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = '#fff';
      ctx.fillRect(o.x + 4, o.y + 4, o.w - 8, 6);
      ctx.globalAlpha = 1;
    }
  }

  function drawParticles() {
    for (let p of particles) {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = `hsl(${p.hue} 90% 60%)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Main loop
  let last = performance.now();
  let timeAlive = 0;
  function loop(now) {
    const dt = now - last; // ms
    last = now;
    if (running) timeAlive += dt;

    drawBackground(now);

    if (running) {
      spawnObstacle(dt, timeAlive);
      updatePlayer(dt);
      updateObstacles(dt, now);
      if (collide()) {
        running = false;
        burst(player.x, player.y, 80);
        overlay.classList.remove('hidden');
        finalScore.textContent = Math.floor(score);
        best = Math.max(best, Math.floor(score));
        localStorage.setItem('cr_best', best);
        elBest.textContent = best;
      }
      score += dt * 0.02 + obstacles.length * 0.005;
      elScore.textContent = Math.floor(score);
    }

    updateParticles(dt);

    drawTrail();
    drawObstacles();
    drawPlayer();
    drawParticles();

    requestAnimationFrame(loop);
  }

  function start() {
    reset();
    overlay.classList.add('hidden');
    running = true;
    timeAlive = 0;
  }

  restartBtn.addEventListener('click', start);
  // Start on first interaction
  cvs.addEventListener('pointerdown', () => { if (!running) start(); }, { once: false });
  window.addEventListener('keydown', (e) => { if (!running && (e.key.startsWith('Arrow') || 'wasd'.includes(e.key.toLowerCase()))) start(); });

  // Kick off render loop
  requestAnimationFrame(loop);
})();
