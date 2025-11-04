// rankingPanel.js - Detailed ranking by years
(function() {
  console.log("[rankingPanel] init");
  
  const rankingCard = document.createElement("div");
  rankingCard.className = "ranking-card";
  rankingCard.style.display = "none";
  rankingCard.innerHTML = `
    <div class="ranking-header">
      <h4>Рейтинг по годам</h4>
      <button id="closeRankingCard">✕</button>
    </div>
    <div class="ranking-year-selector">
      <select id="rankingYearSelect">
        <option value="2020">2020</option>
        <option value="2021">2021</option>
        <option value="2022">2022</option>
        <option value="2023">2023</option>
        <option value="2024">2024</option>
      </select>
    </div>
    <div class="ranking-list" id="rankingList"></div>
  `;

  function attachRankingCard() {
    const mainArea = document.querySelector(".main-area");
    if (mainArea && !rankingCard.parentNode) {
      mainArea.appendChild(rankingCard);
      console.log("[rankingPanel] card appended to .main-area");
    }
  }

  function showRankingCard(year, clientX, clientY, grouping) {
    attachRankingCard();
    
    const yearData = getYearData(grouping, year);
    if (!yearData || yearData.length === 0) return;
    
    // Sort by descending index
    const sortedData = yearData.slice().sort((a, b) => 
      d3.descending(overallScore(a), overallScore(b))
    );
    
    document.getElementById('rankingYearSelect').value = year;
    const rankingList = document.getElementById('rankingList');
    rankingList.innerHTML = '';
    
    // Create column headers
    const headerRow = document.createElement('div');
    headerRow.className = 'ranking-row ranking-header-row';
    headerRow.innerHTML = `
      <div class="rank-position">Место</div>
      <div class="rank-name">${getGroupingLabel(grouping)}</div>
      <div class="rank-score">Индекс</div>
      <div class="rank-change">Изменение</div>
    `;
    rankingList.appendChild(headerRow);
    
    // Fill the ranking
    sortedData.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'ranking-row';
      
      const currentScore = overallScore(item);
      const prevYearData = getYearData(grouping, (parseInt(year) - 1).toString());
      let change = null;
      
      if (prevYearData) {
        const prevItem = prevYearData.find(d => d.name === item.name);
        if (prevItem) {
          const prevScore = overallScore(prevItem);
          change = currentScore - prevScore;
        }
      }
      
      row.innerHTML = `
        <div class="rank-position">${index + 1}</div>
        <div class="rank-name">${item.name}</div>
        <div class="rank-score">${currentScore.toFixed(2)}</div>
        <div class="rank-change ${change > 0 ? 'positive' : change < 0 ? 'negative' : ''}">
          ${change !== null ? (change > 0 ? '↗' : change < 0 ? '↘' : '→') + Math.abs(change).toFixed(2) : '—'}
        </div>
      `;
      
      row.addEventListener('mouseenter', () => {
        highlightTrendLine(item.name);
      });
      
      rankingList.appendChild(row);
    });
    
    // Position the card
    positionRankingCard(clientX, clientY);
    rankingCard.style.display = 'block';
  }
  
  function positionRankingCard(clientX, clientY) {
    const rect = rankingCard.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let left = clientX + 20;
    let top = clientY + 20;
    
    if (left + rect.width > viewportWidth - 20) {
      left = clientX - rect.width - 20;
    }
    
    if (top + rect.height > viewportHeight - 20) {
      top = viewportHeight - rect.height - 20;
    }
    
    rankingCard.style.left = left + 'px';
    rankingCard.style.top = top + 'px';
  }
  
  function hideRankingCard() {
    rankingCard.style.display = 'none';
  }
  
  function getGroupingLabel(grouping) {
    const labels = {
      'Region': 'Регион',
      'AgeGroup': 'Возрастная группа', 
      'Gender': 'Пол',
      'SettlementType': 'Тип поселения'
    };
    return labels[grouping] || 'Элемент';
  }
  
  // Initialization
  function initRankingPanel() {
    attachRankingCard();
    
    // Event handlers
    document.getElementById('closeRankingCard')?.addEventListener('click', hideRankingCard);
    document.getElementById('rankingYearSelect')?.addEventListener('change', function() {
      const year = this.value;
      const rect = rankingCard.getBoundingClientRect();
      showRankingCard(year, rect.left, rect.top, currentGrouping);
    });
    
    // Add handlers for trend graph points
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(() => {
        const trendSvg = d3.select('#trendViz');
        if (!trendSvg.empty()) {
          trendSvg.selectAll('.trend-dot').on('click', function(event, d) {
            showRankingCard(d.year, event.clientX, event.clientY, currentGrouping);
          });
        }
      }, 2000);
    });
  }
  
  // Export functions
  window.showRankingCard = showRankingCard;
  window.hideRankingCard = hideRankingCard;
  window.initRankingPanel = initRankingPanel;
  
  console.log("[rankingPanel] ready");
})();