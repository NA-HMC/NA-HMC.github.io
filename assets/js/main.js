(function () {
  var thumb = document.getElementById("fig1-thumb");
  var lightbox = document.getElementById("lightbox");

  if (thumb && lightbox) {
    thumb.addEventListener("click", function () {
      lightbox.style.display = "flex";
    });
    lightbox.addEventListener("click", function () {
      lightbox.style.display = "none";
    });
  }

  function framePath(dir, idx) {
    return dir + "/frame_" + String(idx).padStart(3, "0") + ".png";
  }

  function startTrajectoryAnimation(img) {
    var dir = img.getAttribute("data-frame-dir");
    var frameCount = parseInt(img.getAttribute("data-frame-count") || "0", 10);
    var frameMs = parseInt(img.getAttribute("data-frame-ms") || "170", 10);
    var holdMs = parseInt(img.getAttribute("data-hold-ms") || "5000", 10);
    if (!dir || frameCount < 2) return;

    var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      img.src = framePath(dir, frameCount - 1);
      return;
    }

    var timer = null;
    var idx = 0;

    function preloadNext(baseIdx) {
      for (var k = 1; k <= 3; k++) {
        var j = (baseIdx + k) % frameCount;
        var cache = new Image();
        cache.src = framePath(dir, j);
      }
    }

    function tick() {
      img.src = framePath(dir, idx);
      preloadNext(idx);

      var delay = frameMs;
      if (idx === frameCount - 1) {
        idx = 0;
        delay = holdMs;
      } else {
        idx += 1;
      }
      timer = window.setTimeout(tick, delay);
    }

    tick();

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (timer) {
          window.clearTimeout(timer);
          timer = null;
        }
      } else if (!timer) {
        tick();
      }
    });
  }

  var trajSeq = document.querySelectorAll(".traj-seq");
  for (var i = 0; i < trajSeq.length; i++) {
    startTrajectoryAnimation(trajSeq[i]);
  }
})();
