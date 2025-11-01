// detailCard.js
// Renders and positions the floating detail card for each "flower".

(function () {
  console.log("[detailCard] init");

  // We'll create the card dynamically on page load, so index.html
  // does not have to hardcode the markup.
  const card = document.createElement("div");
  card.className = "detail-card";
  card.style.display = "none";

  const headerEl = document.createElement("div");
  headerEl.className = "detail-header";
  headerEl.id = "detailTitle";
  headerEl.textContent = "—";
  card.appendChild(headerEl);

  // scale ticks row (0,2,4,6,8,10)
  const scaleRow = document.createElement("div");
  scaleRow.className = "scale-row";
  scaleRow.innerHTML = `
    <span>0</span><span>2</span><span>4</span>
    <span>6</span><span>8</span><span>10</span>
  `;
  card.appendChild(scaleRow);

  // container for bars
  const barsWrap = document.createElement("div");
  barsWrap.id = "detailBars";
  card.appendChild(barsWrap);

  // satisfaction / overall note
  const extraWrap = document.createElement("div");
  extraWrap.id = "detailExtra";
  extraWrap.className = "detail-extra";
  card.appendChild(extraWrap);

  // attach card into .main-area after DOM is ready
  function attachCardParent() {
    const mainArea = document.querySelector(".main-area");
    if (mainArea && !card.parentNode) {
      mainArea.appendChild(card);
      console.log("[detailCard] card appended");
    }
  }
  attachCardParent();
  window.addEventListener("load", attachCardParent);

  /**
   * Show detail card.
   * @param {Object} item  - { name, dims:{dimKey:value...}, satisfaction?:number }
   * @param {number} clientX
   * @param {number} clientY
   * @param {Array} DIMENSIONS - [{key,label},...]
   * @param {Function} colorScale - d3 scale to pick colors for each dimension
   */
  function showDetailCard(item, clientX, clientY, DIMENSIONS, colorScale) {
    attachCardParent();

    // Title
    headerEl.textContent = item.name || "—";

    // Bars for every dimension
    barsWrap.innerHTML = "";
    DIMENSIONS.forEach((dim, i) => {
      const rawScore = item.dims?.[dim.key];
      if (rawScore == null || isNaN(rawScore)) return; // skip missing

      const row = document.createElement("div");
      row.className = "bar-row";

      const labelDiv = document.createElement("div");
      labelDiv.className = "bar-label";
      labelDiv.textContent = dim.label;
      row.appendChild(labelDiv);

      const rightWrap = document.createElement("div");
      rightWrap.className = "bar-wrapper";

      const track = document.createElement("div");
      track.className = "bar-track";

      const fill = document.createElement("div");
      fill.className = "bar-fill";
      fill.style.background = colorScale(i);
      fill.style.width = (parseFloat(rawScore) / 10 * 120) + "px";

      const val = document.createElement("div");
      val.className = "bar-value";
      val.textContent = Number(rawScore).toFixed(1);

      track.appendChild(fill);
      rightWrap.appendChild(track);
      rightWrap.appendChild(val);
      row.appendChild(rightWrap);

      barsWrap.appendChild(row);
    });

    // Extra info: satisfaction, total index
    let extraLines = [];
    if (typeof item.satisfaction === "number") {
      extraLines.push(
        `Удовлетворённость жизнью: ${item.satisfaction.toFixed(2)} / 10`
      );
    }
    if (typeof item.overallScore === "number") {
      extraLines.push(
        `Итоговый индекс (с учётом весов): ${item.overallScore.toFixed(2)} / 10`
      );
    }
    extraWrap.textContent = extraLines.join(" • ");

    // Position card near cursor, but keep on screen
    const cardWidth = 360;
    const cardHeight = 340;
    let left = clientX + 20;
    let top = clientY + 20;
    const pageW = window.innerWidth;
    const pageH = window.innerHeight;

    if (left + cardWidth > pageW - 20) {
      left = pageW - cardWidth - 20;
    }
    if (top + cardHeight > pageH - 20) {
      top = pageH - cardHeight - 20;
    }

    card.style.left = left + "px";
    card.style.top = top + "px";
    card.style.display = "block";
  }

  function hideDetailCard() {
    card.style.display = "none";
  }

  // Expose globally so index.html can call them
  window.showDetailCard = showDetailCard;
  window.hideDetailCard = hideDetailCard;

  console.log("[detailCard] ready");
})();
