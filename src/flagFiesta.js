// Flag Fiesta has no captures yet, so its phone screen is drawn live on a canvas.
// Replace it by adding screenshots to the project in src/content.js.

const rr = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

/* ---------- Flag Fiesta: a living phone screen ---------- */
const FLAGS = [
  { name: 'Colombia', draw: (c, x, y, w, h) => { c.fillStyle = '#FCD116'; c.fillRect(x, y, w, h / 2); c.fillStyle = '#003893'; c.fillRect(x, y + h / 2, w, h / 4); c.fillStyle = '#CE1126'; c.fillRect(x, y + h * 0.75, w, h / 4); } },
  { name: 'Japan', draw: (c, x, y, w, h) => { c.fillStyle = '#fff'; c.fillRect(x, y, w, h); c.fillStyle = '#BC002D'; c.beginPath(); c.arc(x + w / 2, y + h / 2, h * 0.3, 0, Math.PI * 2); c.fill(); } },
  { name: 'Sweden', draw: (c, x, y, w, h) => { c.fillStyle = '#006AA7'; c.fillRect(x, y, w, h); c.fillStyle = '#FECC00'; c.fillRect(x + w * 0.31, y, w * 0.12, h); c.fillRect(x, y + h * 0.4, w, h * 0.2); } },
  { name: 'Nigeria', draw: (c, x, y, w, h) => { c.fillStyle = '#008751'; c.fillRect(x, y, w, h); c.fillStyle = '#fff'; c.fillRect(x + w / 3, y, w / 3, h); } },
  { name: 'Spain', draw: (c, x, y, w, h) => { c.fillStyle = '#AA151B'; c.fillRect(x, y, w, h); c.fillStyle = '#F1BF00'; c.fillRect(x, y + h / 4, w, h / 2); } },
];
const DECOYS = ['Peru', 'Ecuador', 'Norway', 'Italy', 'Chile', 'Korea', 'Ireland', 'Mexico', 'Finland', 'Ghana'];

export function makeFlagFiestaScreen() {
  const W = 540, H = 1170;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d');
  const fontUI = '"Bricolage Grotesque", system-ui, sans-serif';

  const draw = (t) => {
    const round = Math.floor(t / 3.2);
    const phase = (t % 3.2) / 3.2;
    const flag = FLAGS[round % FLAGS.length];

    // sky
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#FF7A59'); g.addColorStop(0.55, '#FFB547'); g.addColorStop(1, '#FFE08A');
    c.fillStyle = g; c.fillRect(0, 0, W, H);

    // bunting
    const cols = ['#2B59C3', '#fff', '#E63946', '#2A9D8F', '#FFD166'];
    for (let i = 0; i < 12; i++) {
      const x = i * 50 - 10, y = 120 + Math.sin(i * 0.9) * 6;
      c.fillStyle = cols[i % cols.length];
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + 44, y + 4); c.lineTo(x + 20, y + 52); c.closePath(); c.fill();
    }
    c.strokeStyle = 'rgba(60,20,0,.45)'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(0, 118); c.quadraticCurveTo(W / 2, 140, W, 118); c.stroke();

    // status
    c.fillStyle = '#3B1F0A'; c.font = `700 30px ${fontUI}`;
    c.fillText(`Round ${(round % 10) + 1} of 10`, 36, 230);
    c.textAlign = 'right'; c.fillText(`★ ${120 + round * 40}`, W - 36, 230); c.textAlign = 'left';

    // timer bar
    rr(c, 36, 256, W - 72, 18, 9); c.fillStyle = 'rgba(59,31,10,.18)'; c.fill();
    rr(c, 36, 256, (W - 72) * (1 - phase), 18, 9); c.fillStyle = '#3B1F0A'; c.fill();

    // flag card
    const fx = 60, fy = 320, fw = W - 120, fh = 290;
    c.save(); c.shadowColor = 'rgba(80,30,0,.35)'; c.shadowBlur = 30; c.shadowOffsetY = 14;
    rr(c, fx - 14, fy - 14, fw + 28, fh + 28, 28); c.fillStyle = '#fff'; c.fill(); c.restore();
    c.save(); rr(c, fx, fy, fw, fh, 16); c.clip(); flag.draw(c, fx, fy, fw, fh); c.restore();

    c.fillStyle = '#3B1F0A'; c.font = `800 44px ${fontUI}`; c.textAlign = 'center';
    c.fillText('Whose flag is this?', W / 2, 690); c.textAlign = 'left';

    // answers
    const opts = [flag.name, DECOYS[(round * 3) % 10], DECOYS[(round * 3 + 4) % 10], DECOYS[(round * 3 + 7) % 10]];
    const order = [(round) % 4, (round + 1) % 4, (round + 2) % 4, (round + 3) % 4];
    const solved = phase > 0.62;
    order.forEach((oi, k) => {
      const bx = 36 + (k % 2) * ((W - 72) / 2 + 8), by = 740 + Math.floor(k / 2) * 150;
      const bw = (W - 72) / 2 - 8, bh = 130;
      const correct = oi === 0;
      c.fillStyle = solved && correct ? '#2A9D8F' : '#fff';
      rr(c, bx, by + 8, bw, bh, 26); c.fillStyle = solved && correct ? '#1B6E64' : '#E9C08A'; c.fill();
      rr(c, bx, by, bw, bh, 26); c.fillStyle = solved && correct ? '#2A9D8F' : '#FFFAF0'; c.fill();
      c.fillStyle = solved && correct ? '#fff' : '#3B1F0A'; c.font = `700 36px ${fontUI}`; c.textAlign = 'center';
      c.fillText(opts[oi], bx + bw / 2, by + bh / 2 + 12); c.textAlign = 'left';
    });

    // confetti on correct
    if (solved) {
      const p = (phase - 0.62) / 0.38;
      for (let i = 0; i < 40; i++) {
        const x = (i * 97) % W, y = p * 700 + ((i * 53) % 300) - 100;
        c.fillStyle = cols[i % cols.length];
        c.save(); c.translate(x, y); c.rotate(i + p * 6); c.fillRect(-6, -10, 12, 20); c.restore();
      }
    }
  };
  draw(0);
  return { canvas: cv, draw };
}

