const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');
const sky    = document.getElementById('sky');
const msg    = document.getElementById('message');
const hint   = document.getElementById('hint');

let W, H;
function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', () => {
  resize();
});

// ── COLOUR PALETTES ──
const JASMINE        = ['#fff8f0', '#fdf5e6', '#fff0d8', '#fef9ec', '#fffaf2'];
const JASMINE_CENTER = ['#f5d980', '#f0d060', '#e8c840', '#f7e090'];
const TULIP          = ['#f9c8c8', '#f5a8b8', '#f2b8c8', '#fad0d8', '#f0c0d0'];
const TULIP2         = ['#e8a0b0', '#d890a8', '#c87898'];
const WHITE          = ['#ffffff', '#f8f8f8', '#fafafa', '#f5f5f0'];
const LEAF           = ['#7d9171', '#6b8060', '#859e78', '#5a7050', '#92a882'];

// ── FLOWER CLASS ──
class Flower {
  constructor(x, delay, type, scale = 1) {
    this.x         = x;
    this.delay     = delay;
    this.type      = type; // 'jasmine' | 'tulip' | 'white'
    this.scale     = scale;
    this.t         = -delay;
    this.height    = (0.35 + Math.random() * 0.35) * H;
    this.sway      = (Math.random() - 0.5) * 18;
    this.swaySpeed = 0.4 + Math.random() * 0.6;
    this.swayPhase = Math.random() * Math.PI * 2;
    this.bloom     = 0;
    this.progress  = 0;
    this.growing   = false;
    this.done      = false;
    this.leaves    = [
      { side: -1, pos: 0.35 + Math.random() * 0.2, angle: -0.6 - Math.random() * 0.4, len: 18 + Math.random() * 14 },
      { side:  1, pos: 0.55 + Math.random() * 0.2, angle:  0.6 + Math.random() * 0.4, len: 16 + Math.random() * 12 },
    ];
  }

  start() { this.growing = true; }

  update(dt) {
    if (!this.growing) return;
    this.t += dt;
    if (this.t < 0) return;

    // ── adjust grow speed here ──
    const growSpeed = 0.5 + Math.random() * 0.1;

    this.progress = Math.min(1, this.progress + dt * growSpeed * 0.6);

    // bloom starts when stem is 85% grown
    if (this.progress > 0.85) {
      this.bloom = Math.min(1, this.bloom + dt * 2.5);
    }

    if (this.progress >= 1 && this.bloom >= 1) this.done = true;
  }

  draw(time) {
    if (!this.growing || this.progress === 0) return;

    const p    = this.progress;
    const sway = Math.sin(time * this.swaySpeed + this.swayPhase) * this.sway * p;

    const baseX = this.x;
    const baseY = H;
    const tipX  = baseX + sway;
    const tipY  = baseY - this.height * p;
    const cpX   = baseX + sway * 0.5;
    const cpY   = baseY - this.height * p * 0.6;

    ctx.save();

    // stem
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.quadraticCurveTo(cpX, cpY, tipX, tipY);
    ctx.strokeStyle = '#6b8060';
    ctx.lineWidth   = (2.5 + this.scale) * Math.min(p * 3, 1);
    ctx.lineCap     = 'round';
    ctx.stroke();

    // leaves
    this.leaves.forEach(leaf => {
      if (p < leaf.pos) return;
      const lp = Math.min(1, (p - leaf.pos) / 0.3);
      const t2 = leaf.pos;
      const lx = (1-t2)*(1-t2)*baseX + 2*(1-t2)*t2*cpX + t2*t2*tipX;
      const ly = (1-t2)*(1-t2)*baseY + 2*(1-t2)*t2*cpY + t2*t2*tipY;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(leaf.angle * leaf.side * lp + (leaf.side > 0 ? 0.2 : -0.2));
      ctx.beginPath();
      ctx.ellipse(leaf.side * leaf.len * lp * 0.5, -4, leaf.len * lp * 0.5, 5 * lp, 0, 0, Math.PI * 2);
      ctx.fillStyle   = LEAF[1];
      ctx.globalAlpha = 0.75 * lp;
      ctx.fill();
      ctx.restore();
    });

    // flower head
    if (this.bloom > 0) {
      ctx.save();
      ctx.translate(tipX, tipY);
      ctx.globalAlpha = this.bloom;
      if      (this.type === 'jasmine') this.drawJasmine(this.bloom);
      else if (this.type === 'tulip')   this.drawTulip(this.bloom);
      else                              this.drawWhiteFlower(this.bloom);
      ctx.restore();
    }

    ctx.restore();
  }

  drawJasmine(b) {
    const s = this.scale * 16;
    if (!this._jc)  this._jc  = JASMINE[Math.floor(Math.random() * JASMINE.length)];
    if (!this._jcc) this._jcc = JASMINE_CENTER[Math.floor(Math.random() * JASMINE_CENTER.length)];

    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate((i / 5) * Math.PI * 2);
      ctx.scale(b, b);
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.75, s * 0.38, s * 0.7, 0, 0, Math.PI * 2);
      ctx.fillStyle   = this._jc;
      ctx.shadowColor = 'rgba(200,169,126,0.3)';
      ctx.shadowBlur  = 8;
      ctx.fill();
      ctx.restore();
    }
    ctx.save();
    ctx.scale(b, b);
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = this._jcc;
    ctx.fill();
    ctx.restore();
  }

  drawTulip(b) {
    const s      = this.scale * 20;
    const spread = 0.3 + b * 0.7;
    if (!this._tc)  this._tc  = TULIP[Math.floor(Math.random() * TULIP.length)];
    if (!this._tc2) this._tc2 = TULIP2[Math.floor(Math.random() * TULIP2.length)];

    const petals = [
      { rx: s*0.45, ry: s*1.1, ox: -s*0.3*spread, oy: -s*0.3, rot: -0.3*spread },
      { rx: s*0.45, ry: s*1.1, ox:  s*0.3*spread, oy: -s*0.3, rot:  0.3*spread },
      { rx: s*0.5,  ry: s*1.2, ox:  0,            oy: -s*0.5, rot:  0          },
    ];
    petals.forEach(p => {
      ctx.save();
      ctx.rotate(p.rot);
      ctx.scale(b, b);
      ctx.beginPath();
      ctx.ellipse(p.ox, p.oy - s * 0.3, p.rx, p.ry, 0, 0, Math.PI * 2);
      ctx.fillStyle   = this._tc;
      ctx.shadowColor = 'rgba(200,100,130,0.2)';
      ctx.shadowBlur  = 10;
      ctx.fill();
      ctx.restore();
    });
    ctx.save();
    ctx.scale(b, b);
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.7, s * 0.28, s * 0.55, 0, 0, Math.PI * 2);
    ctx.fillStyle   = this._tc2;
    ctx.globalAlpha *= 0.5;
    ctx.fill();
    ctx.restore();
  }

  drawWhiteFlower(b) {
    const s = this.scale * 18;
    if (!this._wc) this._wc = WHITE[Math.floor(Math.random() * WHITE.length)];

    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.rotate((i / 6) * Math.PI * 2);
      ctx.scale(b, b);
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.65, s * 0.3, s * 0.62, 0, 0, Math.PI * 2);
      ctx.fillStyle   = this._wc;
      ctx.shadowColor = 'rgba(220,210,200,0.4)';
      ctx.shadowBlur  = 12;
      ctx.fill();
      ctx.restore();
    }
    ctx.save();
    ctx.scale(b, b);
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = '#f5e090';
    ctx.fill();
    ctx.restore();
  }
}

// ── SPAWN FALLING PETALS ──
function spawnFallingPetal() {
  const el     = document.createElement('div');
  el.className = 'petal-fall';
  const size   = 6 + Math.random() * 10;
  const colors = [...JASMINE, ...TULIP, ...WHITE];
  el.style.cssText = `
    left: ${Math.random() * 100}vw;
    top: -20px;
    width: ${size}px;
    height: ${size * 1.6}px;
    background: ${colors[Math.floor(Math.random() * colors.length)]};
    animation-duration: ${8 + Math.random() * 10}s;
    animation-delay: ${Math.random() * 2}s;
    opacity: 0;
    transform: rotate(${Math.random() * 360}deg);
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 20000);
}

// ── CREATE ALL FLOWERS ──
const stems = [];
let bloomed = false;

function createFlowers() {
  stems.length = 0;
  const count = Math.floor(W / 55);
  const types = ['jasmine', 'jasmine', 'jasmine', 'tulip', 'tulip', 'white', 'white'];

  for (let i = 0; i < count; i++) {
    const x     = (i / count) * W * 1.1 - W * 0.05 + (Math.random() - 0.5) * 60;
    const delay = i * 0.12 + Math.random() * 0.4;
    const type  = types[Math.floor(Math.random() * types.length)];
    const scale = 0.7 + Math.random() * 0.7;
    stems.push(new Flower(x, delay, type, scale));
  }
  // extra cluster flowers
  for (let i = 0; i < 6; i++) {
    const x     = Math.random() * W;
    const delay = Math.random() * 1.5;
    const type  = types[Math.floor(Math.random() * types.length)];
    stems.push(new Flower(x, delay, type, 0.5 + Math.random() * 0.5));
  }
}
createFlowers();

// ── ANIMATION LOOP ──
let last    = 0;
let time    = 0;
let started = false;

function loop(ts) {
  const dt = Math.min((ts - last) / 1000, 0.05);
  last  = ts;
  time += dt;

  ctx.clearRect(0, 0, W, H);

  if (started) {
    stems.forEach(s => { s.update(dt); s.draw(time); });

    // trigger message + falling petals when 60% done
    const done = stems.filter(s => s.done).length;
    if (done > stems.length * 0.6 && !bloomed) {
      bloomed = true;
      sky.classList.add('bloomed');
      msg.classList.add('show');
      hint.style.opacity    = '0';
      hint.style.transition = 'opacity 1s';
      for (let i = 0; i < 18; i++) setTimeout(spawnFallingPetal, i * 300);
      setInterval(spawnFallingPetal, 1200);
    }
  }

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// ── START ON TAP / CLICK ──
function trigger() {
  if (!started) {
    started = true;
    stems.forEach(s => s.start());
    hint.style.opacity    = '0';
    hint.style.transition = 'opacity 0.5s';
  }
}

document.addEventListener('click', trigger);
document.addEventListener('touchstart', e => {
  e.preventDefault();
  trigger();
}, { passive: false });

// auto-start after 1.5s if no tap
setTimeout(() => { if (!started) trigger(); }, 1500);