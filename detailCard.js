// detailCard.js
// Floating detail card logic (OECD-style breakdown panel)

(function(){
  console.log("[detailCard] init");

  // create the card element once
  const card = document.createElement("div");
  card.className = "detail-card";
  card.style.display = "none";

  // header (title)
  const headerEl = document.createElement("div");
  headerEl.className = "detail-header";
  headerEl.id = "detailTitle";
  headerEl.textContent = "—";
  card.appendChild(headerEl);

  // little 0 2 4 6 8 10 row above bars
  const scaleRow = document.createElement("div");
  scaleRow.className = "scale-row";
  scaleRow.innerHTML = `
    <span>0</span><span>2</span><span>4</span><span>6</span><span>8</span><span>10</span>
  `;
  card.appendChild(scaleRow);

  // placeholder for bars
  const barsWrap = document.createElement("div");
  barsWrap.id = "detailBars";
  card.appendChild(barsWrap);

  // make sure card lives inside .main-area
  function attachCardParent(){
    const mainArea = document.querySelector(".main-area");
    if (!mainArea) {
      console.warn("[detailCard] .main-area not found yet");
      return;
    }
    if (!card.parentNode) {
      mainArea.appendChild(card);
      console.log("[detailCard] card appended to .main-area");
    }
  }

  attachCardParent();
  window.addEventListener("load", attachCardParent);

  // public: render + show
  function showDetailCard(item, clientX, clientY, DIMENSIONS, colorScale) {
    attachCardParent();

    if (!item || !item.dims) {
      console.error("[detailCard] showDetailCard called with bad item:", item);
      return;
    }

    headerEl.textContent = item.name;
    barsWrap.innerHTML = "";

    // build bar rows based on ACTUAL (raw) scores, not weighted
    DIMENSIONS.forEach((dim, i) => {
      const rawScore = item.dims[dim.key]; // number 0..10
      const color    = colorScale(i);

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
      fill.style.background = color;
      fill.style.width = (rawScore/10 * 120) + "px";
      track.appendChild(fill);

      const val = document.createElement("div");
      val.className = "bar-value";
      val.textContent = rawScore.toFixed(1);

      rightWrap.appendChild(track);
      rightWrap.appendChild(val);

      row.appendChild(rightWrap);
      barsWrap.appendChild(row);
    });

    // position card relative to .main-area so it never leaves that container
    const cardWidth  = 360;
    const cardHeight = 320;
    const margin = 12; // inner margin from container edges

    const mainArea = document.querySelector('.main-area');
    if (mainArea) {
      const rect = mainArea.getBoundingClientRect();

      // clientX/Y are viewport coords; convert to coords relative to mainArea
      const relX = clientX - rect.left;
      const relY = clientY - rect.top;

      // try to place to the right of cursor inside mainArea
      let left = relX + 20;
      let top  = relY + 20;

      // if placing to the right would overflow the right edge of mainArea, place to the left of cursor
      if (relX + 20 + cardWidth > rect.width - margin) {
        left = relX - 20 - cardWidth;
      }

      // clamp so card is fully inside mainArea
      left = Math.max(margin, Math.min(left, rect.width - cardWidth - margin));
      top  = Math.max(margin, Math.min(top, rect.height - cardHeight - margin));

      card.style.left = left + "px";
      card.style.top  = top  + "px";
      card.style.display = "block";
    } else {
      // fallback: viewport-based positioning
      const pageW = window.innerWidth;
      const pageH = window.innerHeight;
      let left = clientX + 20;
      let top  = clientY + 20;
      if (clientX + 20 + cardWidth > pageW - 20) {
        left = clientX - 20 - cardWidth;
      }
      left = Math.max(20, Math.min(left, pageW - cardWidth - 20));
      top  = Math.max(20, Math.min(top, pageH - cardHeight - 20));
      card.style.left = left + "px";
      card.style.top  = top  + "px";
      card.style.display = "block";
    }
  }

  // public: hide
  function hideDetailCard() {
    card.style.display = "none";
  }

  // expose to global scope so index.html script can call
  window.showDetailCard = showDetailCard;
  window.hideDetailCard = hideDetailCard;

  console.log("[detailCard] ready");
})();
