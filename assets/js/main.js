(function () {
  const flowPath = document.getElementById("flow-path");
  const flowParticle = document.getElementById("flow-particle");

  if (flowPath && flowParticle) {
    const len = flowPath.getTotalLength();
    let progress = 0;

    function animateFlow() {
      progress += 1.8;
      if (progress > len) {
        progress = 0;
      }
      const p = flowPath.getPointAtLength(progress);
      flowParticle.setAttribute("cx", String(p.x));
      flowParticle.setAttribute("cy", String(p.y));
      requestAnimationFrame(animateFlow);
    }

    requestAnimationFrame(animateFlow);
  }

  const range = document.getElementById("compare-range");
  const topWrap = document.getElementById("img-top-wrap");
  const handle = document.getElementById("compare-handle");

  function updateSlider(v) {
    const clamped = Math.max(0, Math.min(100, Number(v)));
    if (topWrap) {
      topWrap.style.width = clamped + "%";
    }
    if (handle) {
      handle.style.left = clamped + "%";
    }
  }

  if (range) {
    updateSlider(range.value);
    range.addEventListener("input", function () {
      updateSlider(range.value);
    });
  }

  const canvas = document.getElementById("manifold-canvas");
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  const left = {
    cx: w * 0.27,
    cy: h * 0.58,
    r: 88,
  };
  const right = {
    cx: w * 0.74,
    cy: h * 0.58,
    r: 88,
  };

  const n = 28;
  const points = Array.from({ length: n }, (_, i) => {
    const theta = (2 * Math.PI * i) / n;
    return {
      theta,
      phase: Math.random() * 100,
      drift: 8 + Math.random() * 18,
    };
  });

  function drawPanelLabels() {
    ctx.fillStyle = "#234264";
    ctx.font = "600 14px 'Space Grotesk', sans-serif";
    ctx.fillText("Iterative guidance (drift)", left.cx - 76, 32);
    ctx.fillText("Noise-space sampling (feasible)", right.cx - 88, 32);

    ctx.fillStyle = "#607a97";
    ctx.font = "12px 'Space Grotesk', sans-serif";
    ctx.fillText("off-manifold likelihood pushes", left.cx - 84, h - 16);
    ctx.fillText("DDIM maps proposals back", right.cx - 74, h - 16);
  }

  function drawManifold(cx, cy, r) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "#92abc6";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.62, 0, Math.PI * 2);
    ctx.strokeStyle = "#d2e0ef";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawArrow(x1, y1, x2, y2, color) {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const head = 6;

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - head * Math.cos(ang - 0.4), y2 - head * Math.sin(ang - 0.4));
    ctx.lineTo(x2 - head * Math.cos(ang + 0.4), y2 - head * Math.sin(ang + 0.4));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function animate(ts) {
    const t = ts * 0.001;
    ctx.clearRect(0, 0, w, h);

    drawPanelLabels();
    drawManifold(left.cx, left.cy, left.r);
    drawManifold(right.cx, right.cy, right.r);

    for (const p of points) {
      const local = t + p.phase;

      const dLeft = Math.sin(local * 1.7) * p.drift + Math.sin(local * 0.9) * 7;
      const rLeft = left.r + dLeft;
      const xl = left.cx + Math.cos(p.theta + local * 0.12) * rLeft;
      const yl = left.cy + Math.sin(p.theta + local * 0.12) * rLeft;

      const baseXl = left.cx + Math.cos(p.theta + local * 0.12) * left.r;
      const baseYl = left.cy + Math.sin(p.theta + local * 0.12) * left.r;
      drawArrow(baseXl, baseYl, xl, yl, "rgba(205, 95, 82, 0.42)");

      ctx.beginPath();
      ctx.arc(xl, yl, 3.3, 0, Math.PI * 2);
      ctx.fillStyle = "#d85a4b";
      ctx.fill();

      const dRight = Math.sin(local * 1.5) * 2.5;
      const rRight = right.r + dRight;
      const xr = right.cx + Math.cos(p.theta + local * 0.1) * rRight;
      const yr = right.cy + Math.sin(p.theta + local * 0.1) * rRight;

      ctx.beginPath();
      ctx.arc(xr, yr, 3.3, 0, Math.PI * 2);
      ctx.fillStyle = "#0b8f8a";
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();
