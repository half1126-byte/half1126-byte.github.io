/* ============================================================
   서울이도치과 (YIDO) — before/after 슬라이더
   .ba__range(투명 range)로 --pos(%) 갱신 → .ba__before clip + 디바이더 이동.
   네이티브 range = 키보드(←/→)·드래그·클릭 모두 접근성 자동.
   prefers-reduced-motion 무관(정지 이미지). 라이브러리 0.
   ============================================================ */
(function () {
  "use strict";
  var figs = document.querySelectorAll(".ba");
  Array.prototype.forEach.call(figs, function (fig) {
    var range = fig.querySelector(".ba__range");
    if (!range) return;
    function apply() { fig.style.setProperty("--pos", range.value + "%"); }
    range.addEventListener("input", apply);
    range.addEventListener("change", apply);
    apply();
  });
})();
