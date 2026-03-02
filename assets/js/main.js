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
})();
