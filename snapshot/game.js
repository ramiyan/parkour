(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const statusEl = document.getElementById("status");

  const W = canvas.width;
  const H = canvas.height;

  function makePattern(size, drawFn) {
    const off = document.createElement("canvas");
    off.width = size;
    off.height = size;
    const octx = off.getContext("2d");
    octx.imageSmoothingEnabled = false;
    drawFn(octx, size);
    return ctx.createPattern(off, "repeat");
  }

  const platformPattern = makePattern(32, (octx, s) => {
    octx.fillStyle = "#3b2c2b";
    octx.fillRect(0, 0, s, s);
    octx.fillStyle = "#2a1f1e";
    for (let i = 0; i < s; i += 6) {
      octx.fillRect(i, 0, 2, s);
    }
    octx.fillStyle = "#2e7c57";
    octx.fillRect(0, 0, s, 6);
    octx.fillStyle = "#4fbf7c";
    for (let i = 0; i < s; i += 4) {
      octx.fillRect(i, 0, 2, 2);
    }
  });

  const world = {
    width: 2600,
    height: 2000,
  };

  const input = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    dash: false,
    grapple: false,
    grappleKey: false,
  };

  const mouse = {
    x: 0,
    y: 0,
    worldX: 0,
    worldY: 0,
    rightDown: false,
    leftDown: false,
    fire: false,
  };

  const colors = {
    skyTop: "#f5b3cf",
    skyMid: "#d9a0cc",
    skyBot: "#b88acb",
    cloud: "#f7e6f2",
    hillFar: "#9b7fae",
    hillMid: "#7a6a98",
    trunk: "#6b3a3a",
    bark: "#7e4a44",
    leaf1: "#3c8f6f",
    leaf2: "#4aa07a",
    leaf3: "#5bb48b",
    grass: "#4fbf7c",
    grassDark: "#2e7c57",
    dirt: "#3b2c2b",
    dirtDark: "#2a1f1e",
    accent: "#87f2c0",
    accentSoft: "rgba(135, 242, 192, 0.45)",
    danger: "#ff4b6b",
    goal: "#ffd86a",
  };

  const platforms = [
    { x: 60, y: 1720, w: 480, h: 40 },
    { x: 700, y: 1600, w: 180, h: 26 },
    { x: 1120, y: 1480, w: 180, h: 26 },
    { x: 1520, y: 1340, w: 170, h: 26 },
    { x: 1980, y: 1200, w: 170, h: 26 },
    { x: 2240, y: 1040, w: 160, h: 26 },
    { x: 1880, y: 900, w: 170, h: 26 },
    { x: 1420, y: 800, w: 170, h: 26 },
    { x: 900, y: 700, w: 160, h: 26 },
    { x: 380, y: 620, w: 160, h: 26 },
  ];

  const hazards = [];

  const anchors = [
    { x: 520, y: 1500 },
    { x: 900, y: 1360 },
    { x: 1260, y: 1200 },
    { x: 1620, y: 1040 },
    { x: 2000, y: 880 },
    { x: 2140, y: 760 },
    { x: 1760, y: 700 },
    { x: 1340, y: 620 },
    { x: 940, y: 560 },
    { x: 520, y: 520 },
  ];

  const drones = [];

  const checkpoints = [
    { x: 120, y: 1680, w: 60, h: 40 },
    { x: 1500, y: 1280, w: 60, h: 40 },
  ];

  const goal = { x: 220, y: 520, w: 80, h: 100 };


  const player = {
    x: 140,
    y: 1660,
    w: 18,
    h: 28,
    vx: 0,
    vy: 0,
    onGround: false,
    onWall: 0,
    facing: 1,
    dashReady: true,
    dashTimer: 0,
    respawnX: 140,
    respawnY: 1660,
    grapple: {
      active: false,
      x: 0,
      y: 0,
      length: 0,
      hold: "none",
      lastRelease: 0,
    },
  };

  const timer = {
    start: performance.now(),
    best: null,
  };

  const pixelArt = {
    palette: {
      ".": null,
      "0": "#3b2c2b",
      "1": "#6b3a3a",
      "2": "#8b5a5a",
      "3": "#4fbf7c",
      "4": "#ff4b6b",
      "5": "#f7e6f2",
      "6": "#ffd86a",
      "7": "#d9a0cc",
      "8": "#5bb48b",
      "9": "#9b7fae",
    },
    idle: [
      "....001100000....",
      "...00111110000...",
      "..001111111000...",
      "..011223332110...",
      "..012223333210...",
      "..012233333210...",
      "..001222332100...",
      "...00122222100...",
      "...01122222210..",
      "..011222222210..",
      "..012222222210..",
      "..012227777210..",
      "..012227777210..",
      "..012227777210..",
      "..012222222210..",
      "...01222222210..",
      "...00122222100..",
      "...00120012000..",
      "...01199011000..",
      "..011990011000..",
      "..010000001000..",
      "..011000011000..",
      "...01111111000..",
      "....000000000...",
    ],
    run: [
      "....001100000....",
      "...00111110000...",
      "..001111111000...",
      "..011223332110...",
      "..012223333210...",
      "..012233333210...",
      "..001222332100...",
      "...00122222100...",
      "...01122222210..",
      "..011222222210..",
      "..012222222210..",
      "..012227777210..",
      "..012227777210..",
      "..012227777210..",
      "..012222222210..",
      "...01222222210..",
      "...00122222100..",
      "...00120012000..",
      "..01199011000...",
      ".011990011000...",
      "..010000001000..",
      "...11000001100..",
      "...01111111000..",
      "....000000000...",
    ],
    jump: [
      "....001100000....",
      "...00111110000...",
      "..001111111000...",
      "..011223332110...",
      "..012223333210...",
      "..012233333210...",
      "..001222332100...",
      "...00122222100...",
      "...01122222210..",
      "..011222222210..",
      "..012222222210..",
      "..012227777210..",
      "..012227777210..",
      "..012227777210..",
      "..012222222210..",
      "...01222222210..",
      "...00122222100..",
      "...00120012000..",
      "..01199011000...",
      "..011990011000..",
      "...01000000100..",
      "...11000001100..",
      "...01111111000..",
      "....000000000...",
    ],
    grapple: [
      "....001100000....",
      "...00111110000...",
      "..001111111000...",
      "..011223332110...",
      "..012223333210...",
      "..012233333210...",
      "..001222332100...",
      "...00122222100...",
      "...01122222210..",
      "..011222222210..",
      "..012222222210..",
      "..012227777210..",
      "..012227777210..",
      "..012227777210..",
      "..012222222210..",
      "...01222222210..",
      "...00122222100..",
      "...00120012000..",
      "..01199011000...",
      ".011990011000...",
      "..010000001000..",
      "..011000011000..",
      "...01111111000..",
      "....000000000...",
    ],
  };

  function makeRng(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function randBetween(rng, min, max) {
    return min + (max - min) * rng();
  }

  const rng = makeRng(913);
  const clouds = Array.from({ length: 18 }, () => ({
    x: randBetween(rng, 0, world.width),
    y: randBetween(rng, 80, 700),
    scale: randBetween(rng, 1.2, 2.8),
  }));
  const farTrees = Array.from({ length: 24 }, () => ({
    x: randBetween(rng, 0, world.width),
    scale: randBetween(rng, 0.7, 1.1),
  }));
  const midTrees = Array.from({ length: 16 }, () => ({
    x: randBetween(rng, 0, world.width),
    scale: randBetween(rng, 1.1, 1.8),
  }));
  const heroTree = { x: 520, scale: 2.6 };

  const bushes = Array.from({ length: 30 }, () => ({
    x: randBetween(rng, 0, world.width),
    scale: randBetween(rng, 0.8, 1.4),
  }));

  const flowers = Array.from({ length: 40 }, () => ({
    x: randBetween(rng, 0, world.width),
    tint: rng() > 0.5 ? "#f7e6f2" : "#ffd86a",
  }));

  const rocks = Array.from({ length: 18 }, () => ({
    x: randBetween(rng, 0, world.width),
    scale: randBetween(rng, 0.6, 1.2),
  }));

  const leaves = Array.from({ length: 26 }, () => ({
    x: randBetween(rng, 0, world.width),
    y: randBetween(rng, 200, 1500),
    speed: randBetween(rng, 12, 28),
    drift: randBetween(rng, 6, 18),
    phase: randBetween(rng, 0, Math.PI * 2),
  }));

  function worldToScreen(x, y, cam) {
    return { x: x - cam.x, y: y - cam.y };
  }

  function rectsOverlap(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function distance(ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function resetPlayer() {
    player.x = player.respawnX;
    player.y = player.respawnY;
    player.vx = 0;
    player.vy = 0;
    player.grapple.active = false;
    player.grapple.hold = "none";
    player.grapple.lastRelease = performance.now();
    player.dashReady = true;
    player.dashTimer = 0;
    setStatus("Respawned");
  }

  function findAnchor(mx, my) {
    let best = null;
    let bestDist = 99999;
    for (const a of anchors) {
      const d = distance(mx, my, a.x, a.y);
      if (d < 460 && d < bestDist) {
        best = a;
        bestDist = d;
      }
    }
    return best;
  }

  function findAnchorNearPlayer() {
    const px = player.x + player.w / 2;
    const py = player.y + player.h / 2;
    let best = null;
    let bestDist = 99999;
    for (const a of anchors) {
      const d = distance(px, py, a.x, a.y);
      if (d < 360 && d < bestDist) {
        best = a;
        bestDist = d;
      }
    }
    return best;
  }

  function applyGrappleConstraint(dt) {
    if (!player.grapple.active) return;
    const g = player.grapple;
    const dx = player.x + player.w / 2 - g.x;
    const dy = player.y + player.h / 2 - g.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
    const maxLen = g.length;
    if (dist > maxLen) {
      const diff = (dist - maxLen) / dist;
      player.x -= dx * diff;
      player.y -= dy * diff;
      const vx = player.vx;
      const vy = player.vy;
      const dot = (vx * dx + vy * dy) / dist;
      if (dot > 0) {
        player.vx -= (dot * dx) / dist;
        player.vy -= (dot * dy) / dist;
      }
    }

    if (input.up) {
      g.length = Math.max(10, g.length - 300 * dt);
      const pull = 680 * dt;
      player.vx -= (dx / dist) * pull;
      player.vy -= (dy / dist) * pull;
    } else if (input.down) {
      g.length = Math.min(1200, g.length + 240 * dt);
    }

    const inputX = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const tx = -dy / dist;
    const ty = dx / dist;
    if (inputX !== 0) {
      const swingAccel = 550;
      player.vx += tx * swingAccel * dt * -inputX;
      player.vy += ty * swingAccel * dt * -inputX;
    } else {
      const tangential = player.vx * tx + player.vy * ty;
      const damp = 0.02;
      player.vx -= tx * tangential * damp;
      player.vy -= ty * tangential * damp;
    }
  }

  function updatePlayer(dt) {
    const accel = 900;
    const maxSpeed = player.grapple.active ? 900 : 240;
    const gravity = 1200;

    if (player.dashTimer > 0) {
      player.dashTimer -= dt;
      if (player.dashTimer <= 0) {
        player.dashTimer = 0;
      }
    }

    const ax = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (ax !== 0) player.facing = ax;

    if (player.dashTimer === 0) {
      if (!player.grapple.active) {
        player.vx += ax * accel * dt;
        player.vx *= player.onGround ? 0.9 : 0.98;
      }
    }

    if (!player.grapple.active) {
      player.vx = clamp(player.vx, -maxSpeed, maxSpeed);
    }

    if (player.onGround) {
      if (input.jump) {
        player.vy = -420;
        player.onGround = false;
      }
      if (!input.jump && Math.abs(player.vx) < 8) {
        player.vx = 0;
      }
    } else {
      player.vy += gravity * dt;
    }

    if (!player.grapple.active && player.onWall && !player.onGround && player.vy > 0) {
      player.vy = Math.min(player.vy, 180);
      if (input.jump) {
        player.vy = -380;
        player.vx = -player.onWall * 260;
      }
    }

    if (input.dash && player.dashReady) {
      const dirX = ax || player.facing;
      const dirY = input.up ? -0.5 : input.down ? 0.5 : 0;
      const mag = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
      player.vx = (dirX / mag) * 520;
      player.vy = (dirY / mag) * 520;
      player.dashTimer = 0.18;
      player.dashReady = false;
      player.grapple.active = false;
      player.grapple.hold = "none";
      input.dash = false;
    }

    player.x += player.vx * dt;
    handleCollisions("x");
    player.y += player.vy * dt;
    handleCollisions("y");

    applyGrappleConstraint(dt);

    if (player.onGround) {
      player.dashReady = true;
    }
  }

  function handleCollisions(axis) {
    player.onGround = false;
    player.onWall = 0;
    for (const p of platforms) {
      const rect = { x: player.x, y: player.y, w: player.w, h: player.h };
      if (!rectsOverlap(rect, p)) continue;
      if (axis === "x") {
        if (player.vx > 0) {
          player.x = p.x - player.w;
          player.onWall = 1;
        } else if (player.vx < 0) {
          player.x = p.x + p.w;
          player.onWall = -1;
        }
        player.vx = 0;
      } else {
        if (player.vy > 0) {
          player.y = p.y - player.h;
          player.onGround = true;
        } else if (player.vy < 0) {
          player.y = p.y + p.h;
        }
        player.vy = 0;
      }
    }
  }

  function updateGrapple() {
    const trigger = mouse.fire && !player.grapple.active;
    const keyTrigger = input.grappleKey && !player.grapple.active;

    if (trigger || keyTrigger) {
      let anchor = trigger
        ? findAnchor(mouse.worldX, mouse.worldY)
        : findAnchorNearPlayer();
      if (!anchor && trigger) {
        anchor = findAnchorNearPlayer();
      }
      if (anchor) {
        player.grapple.active = true;
        player.grapple.hold = trigger ? "mouse" : "key";
        player.grapple.x = anchor.x;
        player.grapple.y = anchor.y;
        player.grapple.length = distance(
          player.x + player.w / 2,
          player.y + player.h / 2,
          anchor.x,
          anchor.y
        );
        setStatus("Grapple locked");
      } else {
        setStatus("No anchor in range");
      }
      input.grappleKey = false;
      mouse.fire = false;
    }

    if (
      player.grapple.active &&
      player.grapple.hold === "mouse" &&
      !mouse.rightDown &&
      !mouse.leftDown
    ) {
      const speed = Math.hypot(player.vx, player.vy);
      if (speed > 40) {
        const boost = Math.min(320, speed * 0.6);
        const mag = speed || 1;
        player.vx += (player.vx / mag) * boost;
        player.vy += (player.vy / mag) * boost;
      }
      player.grapple.active = false;
      player.grapple.hold = "none";
      player.grapple.lastRelease = performance.now();
      setStatus("Grapple released");
    }
  }

  function updateDrones(dt) {
    for (const d of drones) {
      d.x += d.speed * d.dir * dt;
      if (d.x < d.min) {
        d.x = d.min;
        d.dir = 1;
      } else if (d.x > d.max) {
        d.x = d.max;
        d.dir = -1;
      }
    }
  }

  function updateCheckpoints() {
    for (const c of checkpoints) {
      const rect = { x: player.x, y: player.y, w: player.w, h: player.h };
      if (rectsOverlap(rect, c)) {
        player.respawnX = c.x + 12;
        player.respawnY = c.y - 40;
      }
    }
  }

  function updateHazards() {
    const rect = { x: player.x, y: player.y, w: player.w, h: player.h };
    for (const h of hazards) {
      if (rectsOverlap(rect, h)) {
        resetPlayer();
        return;
      }
    }
    for (const d of drones) {
      if (rectsOverlap(rect, d)) {
        resetPlayer();
        return;
      }
    }
  }

  function updateGoal() {
    const rect = { x: player.x, y: player.y, w: player.w, h: player.h };
    if (rectsOverlap(rect, goal)) {
      const elapsed = (performance.now() - timer.start) / 1000;
      if (timer.best === null || elapsed < timer.best) {
        timer.best = elapsed;
      }
      setStatus(`Goal reached. Time ${elapsed.toFixed(2)}s`);
    }
  }

  function drawPixelSprite(x, y, sprite, flip) {
    const scale = 2;
    const data = sprite;
    for (let row = 0; row < data.length; row++) {
      const line = data[row];
      for (let col = 0; col < line.length; col++) {
        const ch = line[col];
        const color = pixelArt.palette[ch];
        if (!color) continue;
        const drawX = flip ? (line.length - 1 - col) : col;
        ctx.fillStyle = color;
        ctx.fillRect(x + drawX * scale, y + row * scale, scale, scale);
      }
    }
  }

  function drawCloud(x, y, scale) {
    const w = 22 * scale;
    const h = 8 * scale;
    ctx.fillStyle = colors.cloud;
    ctx.fillRect(x, y, w, h);
    ctx.fillRect(x + 6 * scale, y - 4 * scale, 12 * scale, 4 * scale);
    ctx.fillRect(x + 14 * scale, y + 2 * scale, 10 * scale, 6 * scale);
  }

  function drawTree(x, y, scale, leafColor) {
    const trunkW = 10 * scale;
    const trunkH = 38 * scale;
    ctx.fillStyle = colors.trunk;
    ctx.fillRect(x - trunkW / 2, y - trunkH, trunkW, trunkH);
    ctx.fillStyle = colors.bark;
    ctx.fillRect(x - trunkW / 2 + 2 * scale, y - trunkH + 6 * scale, 2 * scale, 12 * scale);
    ctx.fillStyle = leafColor;
    ctx.fillRect(x - 18 * scale, y - trunkH - 22 * scale, 36 * scale, 18 * scale);
    ctx.fillRect(x - 22 * scale, y - trunkH - 10 * scale, 44 * scale, 16 * scale);
    ctx.fillRect(x - 14 * scale, y - trunkH - 32 * scale, 28 * scale, 12 * scale);
  }

  function drawBush(x, y, scale) {
    ctx.fillStyle = colors.leaf2;
    ctx.fillRect(x - 12 * scale, y - 8 * scale, 24 * scale, 8 * scale);
    ctx.fillStyle = colors.leaf3;
    ctx.fillRect(x - 16 * scale, y - 4 * scale, 32 * scale, 10 * scale);
  }

  function drawFlower(x, y, tint) {
    ctx.fillStyle = colors.grassDark;
    ctx.fillRect(x, y - 6, 2, 6);
    ctx.fillStyle = tint;
    ctx.fillRect(x - 2, y - 10, 6, 4);
  }

  function drawRock(x, y, scale) {
    ctx.fillStyle = colors.dirtDark;
    ctx.fillRect(x - 6 * scale, y - 4 * scale, 12 * scale, 6 * scale);
    ctx.fillStyle = colors.dirt;
    ctx.fillRect(x - 4 * scale, y - 6 * scale, 8 * scale, 4 * scale);
  }

  function drawLeaf(x, y) {
    ctx.fillStyle = colors.leaf1;
    ctx.fillRect(x, y, 3, 2);
  }

  function drawSpriteBird(x, y, dir) {
    ctx.fillStyle = "#3b2c2b";
    ctx.fillRect(x, y, 18, 7);
    ctx.fillStyle = colors.leaf3;
    ctx.fillRect(x + (dir > 0 ? 10 : 2), y - 3, 8, 3);
    ctx.fillStyle = colors.leaf1;
    ctx.fillRect(x + (dir > 0 ? 2 : 12), y + 2, 4, 3);
    ctx.fillStyle = colors.goal;
    ctx.fillRect(x + (dir > 0 ? 14 : 2), y + 2, 2, 2);
  }

  function drawAnchorIcon(x, y, glow) {
    ctx.fillStyle = "rgba(59, 44, 43, 0.9)";
    ctx.fillRect(x - 6, y - 6, 12, 12);
    ctx.strokeStyle = glow ? colors.accent : colors.accentSoft;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 6, y);
    ctx.lineTo(x + 6, y);
    ctx.moveTo(x, y - 6);
    ctx.lineTo(x, y + 6);
    ctx.stroke();
  }

  function drawAnchorBeacon(x, y) {
    const h = 60;
    ctx.fillStyle = "rgba(135, 242, 192, 0.08)";
    ctx.fillRect(x - 2, y - h, 4, h);
  }

  function drawGrappleHead(x, y) {
    ctx.fillStyle = colors.accent;
    ctx.fillRect(x - 4, y - 4, 8, 8);
    ctx.fillStyle = colors.goal;
    ctx.fillRect(x - 1, y - 1, 2, 2);
  }

  function drawForegroundGrass(cam) {
    ctx.fillStyle = colors.grass;
    for (let x = 0; x < W + 20; x += 12) {
      const worldX = x + cam.x * 1.05;
      const sway = Math.sin(worldX / 50) * 2;
      ctx.fillRect(x, H - 18 + sway, 6, 12);
    }
  }

  function drawFarClouds(cam) {
    ctx.fillStyle = "rgba(247, 230, 242, 0.6)";
    for (let i = 0; i < 6; i++) {
      const x = (i * 180 + 80 + cam.x * 0.08) % (W + 200) - 100;
      const y = 80 + i * 26;
      ctx.fillRect(x, y, 80, 12);
      ctx.fillRect(x + 18, y - 6, 36, 8);
    }
  }

  function drawHills(cam, baseY, amplitude, color, parallax) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W + 40; x += 40) {
      const worldX = x + cam.x * parallax;
      const wave =
        Math.sin(worldX / 240) * amplitude +
        Math.sin(worldX / 97) * (amplitude * 0.4);
      const y = baseY + wave - cam.y * parallax * 0.12;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W + 40, H);
    ctx.closePath();
    ctx.fill();
  }

  function drawMountains(cam) {
    const base = H * 0.55;
    ctx.fillStyle = "#b68ea8";
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W + 80; x += 80) {
      const worldX = x + cam.x * 0.15;
      const peak = base + Math.sin(worldX / 240) * 40;
      ctx.lineTo(x, peak);
    }
    ctx.lineTo(W + 80, H);
    ctx.closePath();
    ctx.fill();
  }

  function render(cam) {
    ctx.clearRect(0, 0, W, H);
    const t = performance.now() * 0.002;

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, colors.skyTop);
    grad.addColorStop(0.5, colors.skyMid);
    grad.addColorStop(1, colors.skyBot);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    drawFarClouds(cam);

    clouds.forEach((c) => {
      const sx = c.x - cam.x * 0.15;
      const sy = c.y - cam.y * 0.15;
      if (sx < -120 || sx > W + 120 || sy < -80 || sy > H + 80) return;
      drawCloud(sx, sy, c.scale);
    });

    drawMountains(cam);
    drawHills(cam, H * 0.62, 22, colors.hillFar, 0.22);
    drawHills(cam, H * 0.72, 30, colors.hillMid, 0.35);

    ctx.save();
    ctx.translate(-cam.x, -cam.y);

    const groundY = 1720;

    farTrees.forEach((tree) => {
      drawTree(tree.x, groundY + 120, tree.scale * 0.6, colors.leaf1);
    });

    drawTree(heroTree.x, groundY + 80, heroTree.scale, colors.leaf2);

    midTrees.forEach((tree) => {
      drawTree(tree.x, groundY + 60, tree.scale, colors.leaf3);
    });

    bushes.forEach((b) => drawBush(b.x, groundY + 10, b.scale));
    rocks.forEach((r) => drawRock(r.x, groundY + 18, r.scale));
    flowers.forEach((f) => drawFlower(f.x, groundY + 8, f.tint));

    platforms.forEach((p) => {
      ctx.fillStyle = platformPattern;
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = colors.grass;
      for (let x = p.x; x < p.x + p.w; x += 10) {
        ctx.fillRect(x, p.y - 4, 6, 4);
      }
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      for (let x = p.x + 2; x < p.x + p.w; x += 16) {
        ctx.fillRect(x, p.y - 6, 8, 1);
      }
      ctx.strokeStyle = "rgba(79, 191, 124, 0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.w, p.y);
      ctx.stroke();
    });

    ctx.fillStyle = "#e7d15c";
    checkpoints.forEach((c) => ctx.fillRect(c.x, c.y, c.w, c.h));

    const goalPulse = 0.5 + 0.4 * Math.sin(t * 1.2);
    ctx.fillStyle = colors.goal;
    ctx.fillRect(goal.x, goal.y, goal.w, goal.h);
    ctx.fillStyle = `rgba(255,230,109,${0.2 + goalPulse * 0.4})`;
    ctx.fillRect(goal.x - 12, goal.y + goal.h, goal.w + 24, 44);

    const hoverAnchor = findAnchor(mouse.worldX, mouse.worldY);
    ctx.lineWidth = 1;
    anchors.forEach((a) => {
      const isHover = hoverAnchor && a.x === hoverAnchor.x && a.y === hoverAnchor.y;
      drawAnchorBeacon(a.x, a.y);
      drawAnchorIcon(a.x, a.y, isHover);
      if (isHover) {
        ctx.strokeStyle = colors.accent;
        ctx.beginPath();
        ctx.arc(a.x, a.y, 18, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    drones.forEach((d) => {
      drawSpriteBird(d.x, d.y, d.dir);
    });

    if (player.grapple.active) {
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(player.x + player.w / 2, player.y + player.h / 2);
      ctx.lineTo(player.grapple.x, player.grapple.y);
      ctx.stroke();
      drawGrappleHead(player.grapple.x, player.grapple.y);
    }

    leaves.forEach((leaf) => {
      leaf.y += leaf.speed * (1 / 60);
      leaf.x += Math.sin(t + leaf.phase) * leaf.drift * (1 / 60);
      if (leaf.y > world.height + 40) {
        leaf.y = -20;
        leaf.x = randBetween(rng, 0, world.width);
      }
      drawLeaf(leaf.x, leaf.y);
    });

    const isMoving = Math.abs(player.vx) > 20;
    let frame = pixelArt.idle;
    if (player.grapple.active) {
      frame = pixelArt.grapple;
    } else if (!player.onGround) {
      frame = pixelArt.jump;
    } else if (isMoving && Math.floor(performance.now() / 200) % 2 === 0) {
      frame = pixelArt.run;
    }
    const px = player.x - 8;
    const py = player.y - 12;
    drawPixelSprite(px, py, frame, player.facing < 0);

    ctx.restore();

    drawForegroundGrass(cam);

    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(16, 16, 260, 92);
    ctx.strokeStyle = colors.accentSoft;
    ctx.strokeRect(16, 16, 260, 92);
    ctx.fillStyle = colors.accent;
    ctx.font = "12px Space Mono, monospace";
    ctx.fillText("Move: WASD / Arrows", 26, 38);
    ctx.fillText("Jump: Space", 26, 54);
    ctx.fillText("Grapple: Mouse / E", 26, 70);
    ctx.fillText("Dash: Shift", 26, 86);

    const elapsed = (performance.now() - timer.start) / 1000;
    ctx.fillStyle = "rgba(59, 44, 43, 0.75)";
    ctx.fillRect(W - 160, 16, 140, 36);
    ctx.strokeStyle = colors.accentSoft;
    ctx.strokeRect(W - 160, 16, 140, 36);
    ctx.fillStyle = colors.accent;
    ctx.fillText(`Time ${elapsed.toFixed(2)}s`, W - 150, 38);
    if (timer.best !== null) {
      ctx.fillStyle = colors.goal;
      ctx.fillText(`Best ${timer.best.toFixed(2)}s`, W - 150, 52);
    }
  }

  function update(dt) {
    updateGrapple();
    updatePlayer(dt);
    if (drones.length) updateDrones(dt);
    updateCheckpoints();
    updateHazards();
    updateGoal();
  }

  let last = performance.now();

  function loop(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;

    const cam = {
      x: clamp(player.x + player.w / 2 - W / 2, 0, world.width - W),
      y: clamp(player.y + player.h / 2 - H / 2, 0, world.height - H),
    };

    const rect = canvas.getBoundingClientRect();
    mouse.worldX = (mouse.x - rect.left) * (canvas.width / rect.width) + cam.x;
    mouse.worldY = (mouse.y - rect.top) * (canvas.height / rect.height) + cam.y;

    update(dt);
    render(cam);

    requestAnimationFrame(loop);
  }

  function onKey(e, pressed) {
    switch (e.code) {
      case "ArrowLeft":
      case "KeyA":
        input.left = pressed;
        break;
      case "ArrowRight":
      case "KeyD":
        input.right = pressed;
        break;
      case "ArrowUp":
      case "KeyW":
        input.up = pressed;
        break;
      case "ArrowDown":
      case "KeyS":
        input.down = pressed;
        break;
      case "Space":
        input.jump = pressed;
        break;
      case "ShiftLeft":
      case "ShiftRight":
        if (pressed) input.dash = true;
        break;
      case "KeyE":
        if (pressed) {
          if (player.grapple.active && player.grapple.hold === "key") {
            const speed = Math.hypot(player.vx, player.vy);
            if (speed > 40) {
              const boost = Math.min(320, speed * 0.6);
              const mag = speed || 1;
              player.vx += (player.vx / mag) * boost;
              player.vy += (player.vy / mag) * boost;
            }
            player.grapple.active = false;
            player.grapple.hold = "none";
            player.grapple.lastRelease = performance.now();
            setStatus("Grapple released");
          } else {
            input.grappleKey = true;
          }
        }
        break;
      case "KeyR":
        if (pressed) {
          player.grapple.active = false;
          player.grapple.hold = "none";
          setStatus("Grapple released");
        }
        break;
      default:
        break;
    }
  }

  window.addEventListener("keydown", (e) => {
    if (e.repeat) return;
    onKey(e, true);
  });

  window.addEventListener("keyup", (e) => {
    onKey(e, false);
    if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
      input.dash = false;
    }
  });

  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  canvas.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
      mouse.leftDown = true;
      mouse.fire = true;
    }
    if (e.button === 2) {
      mouse.rightDown = true;
      mouse.fire = true;
    }
  });
  canvas.addEventListener("mouseup", (e) => {
    if (e.button === 0) {
      mouse.leftDown = false;
    }
    if (e.button === 2) {
      mouse.rightDown = false;
    }
  });
  canvas.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  setStatus("Ready");
  requestAnimationFrame(loop);
})();
