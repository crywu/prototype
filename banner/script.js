/**
 * ============================================================================
 * L'ARTISAN DOUX — 全螢幕 10 款點心互動全景物理與狀態控制器
 * 實現核心流程：
 * 1. 動圖撐滿全畫面 (100vw x 100vh)
 * 2. 10 款點心從各向滑入進場，一開始【完全無文字】！
 * 3. 懸浮 (Hover)：放大目標點心，並把鄰近點心稍微往外物理推開。
 * 4. 點擊 (Click)：聚焦選中！目標點心「再次放大」並順滑移往「畫面右側 1/3 處」，
 *    其餘點心退居背景，然後左側的「點心文字詳細說明卡」才優雅浮現！
 * ============================================================================
 */

// 10 款極致點心資料庫 (包含名稱、法文/英名、價格、描述與風味指數)
const DESSERT_DATA = [
  {
    id: 'strawberry-dome',
    name: '皇室草莓香草聖布蕾',
    subtitle: 'Royal Strawberry Vanilla Dome',
    price: '$28',
    badge: '👑 主廚嚴選',
    desc: '甄選法國馬達加斯加頂級香草莢與日本福岡頂級甘王草莓，慢火蒸烤出如絲綢般細膩的香草布蕾，搭配酥脆法式千層餅底，在舌尖綻放層次豐富的微酸與濃郁甘甜。',
    sweetness: 80, richness: 90, texture: 95,
    imgUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&auto=format&fit=crop&q=80',
    fallbackSvg: `<svg viewBox="0 0 100 100" class="dessert-img"><circle cx="50" cy="55" r="40" fill="#f43f5e"/><path d="M30 55 Q50 20 70 55 Z" fill="#fff" opacity="0.8"/><circle cx="50" cy="25" r="12" fill="#e11d48"/><path d="M45 22 Q50 15 55 22 Z" fill="#10b981"/></svg>`
  },
  {
    id: 'matcha-mille-feulle',
    name: '宇治抹茶千層酥',
    subtitle: 'Uji Matcha Mille-Feuille',
    price: '$18',
    badge: '🍃 京都人氣',
    desc: '採用日本京都百年茶舖特級宇治抹茶，經過 72 小時低溫發酵與手工摺疊 730 層起酥餅皮，濃郁抹茶甘苦與香醇紐西蘭天然發酵奶油完美平衡。',
    sweetness: 60, richness: 85, texture: 98,
    imgUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
    fallbackSvg: `<svg viewBox="0 0 100 100" class="dessert-img"><rect x="20" y="35" width="60" height="40" rx="6" fill="#10b981"/><rect x="20" y="45" width="60" height="6" fill="#fff"/><rect x="20" y="59" width="60" height="6" fill="#fff"/><circle cx="50" cy="30" r="10" fill="#f59e0b"/></svg>`
  },
  {
    id: 'caramel-macaron',
    name: '法式焦糖海鹽馬卡龍',
    subtitle: 'Caramel Sea Salt Macaron',
    price: '$14',
    badge: '✨ 甜蜜輕享',
    desc: '正宗巴黎工藝杏仁酥餅，外層薄脆內裡煙韌（Chewy），夾心採用法國布列塔尼鹽之花海鹽與手工焦糖奶油醬，甜鹹交織令人回味無窮。',
    sweetness: 90, richness: 75, texture: 88,
    imgUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80',
    fallbackSvg: `<svg viewBox="0 0 100 100" class="dessert-img"><ellipse cx="50" cy="40" rx="35" ry="16" fill="#f59e0b"/><ellipse cx="50" cy="60" rx="35" ry="16" fill="#f59e0b"/><rect x="18" y="40" width="64" height="20" rx="8" fill="#fff" opacity="0.8"/></svg>`
  },
  {
    id: 'dark-lava-cake',
    name: '熔岩濃黑巧克力蛋糕',
    subtitle: 'Dark Molten Lava Cake',
    price: '$22',
    badge: '🍫 70% 濃郁',
    desc: '選用法國法芙娜（Valrhona）70% 瓜納拉單一產區黑巧克力，切開瞬間溫熱濃郁的黑巧克力熔岩緩緩流出，搭配頂部冰涼的手工香草冰淇淋。',
    sweetness: 70, richness: 98, texture: 90,
    imgUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80',
    fallbackSvg: `<svg viewBox="0 0 100 100" class="dessert-img"><path d="M25 70 L30 35 L70 35 L75 70 Z" fill="#4b5563"/><path d="M40 35 Q50 65 60 35 Z" fill="#7c2d12"/><circle cx="50" cy="28" r="8" fill="#ef4444"/></svg>`
  },
  {
    id: 'mango-tart',
    name: '香芒翡翠慕斯塔',
    subtitle: 'Mango Emerald Mousse Tart',
    price: '$20',
    badge: '🥭 季節限定',
    desc: '嚴選當季特級愛文芒果與阿文索芒果，搭配清爽薄荷椰香百香果慕斯與杏仁香脆塔皮，果香四溢、酸甜沁涼，是夏秋過渡之際的完美甜點。',
    sweetness: 75, richness: 70, texture: 92,
    imgUrl: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=500&auto=format&fit=crop&q=80',
    fallbackSvg: `<svg viewBox="0 0 100 100" class="dessert-img"><ellipse cx="50" cy="65" rx="38" ry="15" fill="#d97706"/><circle cx="50" cy="45" r="28" fill="#f59e0b"/><circle cx="38" cy="38" r="8" fill="#10b981"/><circle cx="62" cy="42" r="6" fill="#fff"/></svg>`
  },
  {
    id: 'blueberry-cheesecake',
    name: '藍莓冰霜起司蛋糕',
    subtitle: 'Blueberry Frost Cheesecake',
    price: '$19',
    badge: '🫐 清爽微酸',
    desc: '澳洲頂級熟成奶油乳酪與野生藍莓果凍層相互交疊，底部為英國消化餅乾與發酵黃油混製酥底，口感輕盈綿密，酸甜奶香恰到好處。',
    sweetness: 65, richness: 88, texture: 85,
    imgUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80',
    fallbackSvg: `<svg viewBox="0 0 100 100" class="dessert-img"><path d="M20 65 L80 65 L75 40 L25 40 Z" fill="#fef08a"/><path d="M20 75 L80 75 L80 65 L20 65 Z" fill="#854d0e"/><circle cx="40" cy="33" r="8" fill="#6366f1"/><circle cx="58" cy="35" r="10" fill="#4f46e5"/></svg>`
  },
  {
    id: 'classic-tiramisu',
    name: '經典義式提拉米蘇',
    subtitle: 'Classic Italian Tiramisu',
    price: '$21',
    badge: '☕ 醇厚濃香',
    desc: '傳承義大利非物質文化遺產配方，義式濃縮咖啡與現磨現釀馬沙拉調味酒浸泡手指餅乾，鋪上綿密豐盈的馬斯卡彭乳酪與可可粉，醇醉撩人。',
    sweetness: 65, richness: 92, texture: 90,
    imgUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80',
    fallbackSvg: `<svg viewBox="0 0 100 100" class="dessert-img"><rect x="25" y="35" width="50" height="40" rx="4" fill="#78350f"/><rect x="25" y="48" width="50" height="10" fill="#fef08a"/><path d="M25 35 Q50 30 75 35 Z" fill="#451a03"/></svg>`
  },
  {
    id: 'rose-lychee-tart',
    name: '玫瑰荔枝覆盆子塔',
    subtitle: 'Rose Lychee Raspberry Tart',
    price: '$24',
    badge: '🌹 浪漫巴黎',
    desc: '致敬大師經典 Ispahan 靈感，在大馬士革玫瑰鮮奶油中嵌入清甜飽滿的玉荷包荔枝肉與鮮酸覆盆子，每一口都散發優雅迷人的花果香氣。',
    sweetness: 75, richness: 78, texture: 94,
    imgUrl: 'https://images.unsplash.com/photo-1508737027454-e6454ef45afd?w=500&auto=format&fit=crop&q=80',
    fallbackSvg: `<svg viewBox="0 0 100 100" class="dessert-img"><circle cx="50" cy="50" r="35" fill="#fb7185"/><circle cx="50" cy="50" r="20" fill="#fff" opacity="0.8"/><circle cx="50" cy="50" r="10" fill="#e11d48"/></svg>`
  },
  {
    id: 'earl-grey-crepe',
    name: '皇家伯爵茶千層蛋糕',
    subtitle: 'Royal Earl Grey Mille-Crepe',
    price: '$23',
    badge: '☕ 英倫紳士',
    desc: '選用川寧皇室皇家伯爵紅茶浸漬牛奶 24 小時，揉入手作極薄可麗餅皮，茶香深邃、佛手柑餘香縈繞，口感如絲綢般在口中輕柔消融。',
    sweetness: 60, richness: 82, texture: 96,
    imgUrl: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=500&auto=format&fit=crop&q=80',
    fallbackSvg: `<svg viewBox="0 0 100 100" class="dessert-img"><rect x="22" y="40" width="56" height="35" rx="4" fill="#d97706"/><line x1="22" y1="48" x2="78" y2="48" stroke="#fff" stroke-width="3"/><line x1="22" y1="56" x2="78" y2="56" stroke="#fff" stroke-width="3"/><line x1="22" y1="64" x2="78" y2="64" stroke="#fff" stroke-width="3"/><circle cx="50" cy="30" r="8" fill="#78350f"/></svg>`
  },
  {
    id: 'french-canele',
    name: '經典波爾多法式可麗露',
    subtitle: 'Classic Bordeaux Canelé',
    price: '$15',
    badge: '🔔 天使之鈴',
    desc: '波爾多百年傳統銅模烤製，外層披覆著深褐色焦香焦糖脆殼，內裡卻是Q彈濕潤、飽含大溪地香草與陳年陳釀蘭姆酒香氣的蜂巢狀糕體。',
    sweetness: 70, richness: 85, texture: 99,
    imgUrl: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=500&auto=format&fit=crop&q=80',
    fallbackSvg: `<svg viewBox="0 0 100 100" class="dessert-img"><path d="M35 30 L65 30 L72 75 L28 75 Z" fill="#78350f" rx="5"/><path d="M35 30 Q50 20 65 30 Z" fill="#451a03"/></svg>`
  }
];

// 物理引擎與狀態管理
let dessertItems = [];
let selectedIndex = -1; // -1 表示全景未選中狀態
let isHovering = false;

// 頁面初始化
document.addEventListener('DOMContentLoaded', () => {
  createBackgroundParticles();
  initFullscreenStage();
  setupEventListeners();
  
  // 延遲 300ms 開始多方向進場動畫
  setTimeout(() => {
    playEntranceAnimation();
  }, 300);
});

/**
 * 1. 產生全螢幕動態背景光點粒子
 */
function createBackgroundParticles() {
  const container = document.getElementById('particles-container');
  const count = 30;
  
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 2;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${Math.random() * 100}vw`;
    p.style.animationDuration = `${Math.random() * 15 + 10}s`;
    p.style.animationDelay = `${Math.random() * -20}s`;
    container.appendChild(p);
  }
}

/**
 * 2. 初始化 10 款點心在全螢幕畫布上的初始漂浮座標與 DOM 構建
 * 注意：一開始進場與正常懸浮時【完全不含文字說明】！
 */
function initFullscreenStage() {
  const stage = document.getElementById('stage');
  stage.innerHTML = '';
  dessertItems = [];

  const W = window.innerWidth;
  const H = window.innerHeight;

  // 在全螢幕畫布上為 10 個點心計算和諧的分佈座標 (2 行 x 5 列有機錯落)
  DESSERT_DATA.forEach((item, index) => {
    const col = index % 5;
    const row = Math.floor(index / 5);
    
    // 計算全螢幕網格基準點，預留上下左右 12% 邊界
    const marginX = W * 0.12;
    const marginY = H * 0.22;
    const stepX = (W - marginX * 2) / 4;
    const stepY = (H - marginY * 2 - 80) / 1; // 2行分佈
    
    // 加上隨機有機偏移
    const jitterX = (Math.random() - 0.5) * 60;
    const jitterY = (Math.random() - 0.5) * 50;
    
    const targetX = marginX + col * stepX + jitterX;
    const targetY = marginY + row * stepY + jitterY;
    
    // 起始滑入座標：從四面八方螢幕外飛入！
    let startX, startY;
    if (index % 4 === 0) { startX = -300; startY = -300; } // 左上外
    else if (index % 4 === 1) { startX = W + 300; startY = -300; } // 右上外
    else if (index % 4 === 2) { startX = -300; startY = H + 300; } // 左下外
    else { startX = W + 300; startY = H + 300; } // 右下外

    const el = document.createElement('div');
    el.className = 'dessert-item';
    el.dataset.index = index;
    
    // 一開始卡片【純粹只有精美食物圖片】，完全不顯示任何文字標籤！
    el.innerHTML = `
      <div class="dessert-card">
        <div class="dessert-img-wrap">
          <img src="${item.imgUrl}" alt="美味點心" class="dessert-img"
               onerror="this.outerHTML='${item.fallbackSvg}'">
        </div>
      </div>
    `;

    // 初始位置
    el.style.transform = `translate3d(${startX}px, ${startY}px, 0) scale(0.2)`;
    el.style.opacity = '0';

    // 綁定事件
    el.addEventListener('mouseenter', () => handleHover(index));
    el.addEventListener('mouseleave', handleLeave);
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      handleClickSelect(index);
    });

    stage.appendChild(el);
    dessertItems.push({
      element: el,
      data: item,
      startX, startY,
      targetX, targetY,
      currentX: startX, currentY: startY
    });
  });

  // 點擊空白背景也可取消選中
  document.body.addEventListener('click', () => {
    if (selectedIndex !== -1) {
      resetToPanoramaView();
    }
  });
}

/**
 * 3. 播放 10 款點心多向滑入進場動畫
 * 此時畫面上純粹是 10 款美味點心，沒有任何文字干擾！
 */
function playEntranceAnimation() {
  selectedIndex = -1;
  document.getElementById('info-panel').classList.add('hidden');
  document.getElementById('btn-reset-view').classList.add('hidden');
  
  dessertItems.forEach((item, idx) => {
    const el = item.element;
    el.classList.remove('is-selected', 'is-dimmed');
    
    setTimeout(() => {
      el.style.transition = 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.8s ease';
      el.style.opacity = '1';
      el.style.zIndex = '10';
      
      const posX = item.targetX - 80; // 卡片寬 160，半徑 80
      const posY = item.targetY - 80;
      
      el.style.transform = `translate3d(${posX}px, ${posY}px, 0) scale(1)`;
      item.currentX = posX;
      item.currentY = posY;
    }, idx * 70); // 順序錯開 70ms
  });
}

/**
 * 4. 懸浮互動 (Hover)：放大目標點心，並將鄰近點心稍微往外推開！
 * 注意：在選中模式 (selectedIndex !== -1) 下不觸發一般推開，以避免干擾焦點
 */
function handleHover(hoverIdx) {
  if (selectedIndex !== -1) return; // 已選中時鎖定焦點狀態
  isHovering = true;
  
  const activeItem = dessertItems[hoverIdx];
  const activeCenterX = activeItem.targetX;
  const activeCenterY = activeItem.targetY;

  dessertItems.forEach((item, idx) => {
    const el = item.element;
    const basePosX = item.targetX - 80;
    const basePosY = item.targetY - 80;

    if (idx === hoverIdx) {
      // 懸浮主體：放大至 1.3 倍並至頂層
      el.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
      el.style.transform = `translate3d(${basePosX}px, ${basePosY}px, 0) scale(1.32)`;
      el.style.zIndex = '50';
    } else {
      // 計算其他點心與懸浮點心的向量距離
      const dx = item.targetX - activeCenterX;
      const dy = item.targetY - activeCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxRadius = 600; // 物理推開作用範圍

      if (dist < maxRadius && dist > 0) {
        // 距離越近，稍微推開力道越強 (推開 40~70px)
        const force = Math.pow((maxRadius - dist) / maxRadius, 1.4) * 65;
        const pushX = (dx / dist) * force;
        const pushY = (dy / dist) * force;
        
        el.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)';
        el.style.transform = `translate3d(${basePosX + pushX}px, ${basePosY + pushY}px, 0) scale(0.92)`;
        el.style.zIndex = '10';
      } else {
        el.style.transform = `translate3d(${basePosX}px, ${basePosY}px, 0) scale(1)`;
        el.style.zIndex = '10';
      }
    }
  });
}

/**
 * 5. 滑鼠移出：所有點心彈回原位
 */
function handleLeave() {
  if (selectedIndex !== -1) return;
  isHovering = false;

  dessertItems.forEach((item) => {
    const el = item.element;
    const posX = item.targetX - 80;
    const posY = item.targetY - 80;

    el.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    el.style.transform = `translate3d(${posX}px, ${posY}px, 0) scale(1)`;
    el.style.zIndex = '10';
  });
}

/**
 * 6. 核心需求：點擊選擇點心 (Click Select)
 * 「等我點擊點心後 再次放大點心 並移往畫面右側 1/3 處 然後關於點心的文字說明才出現！」
 */
function handleClickSelect(clickedIdx) {
  selectedIndex = clickedIdx;
  const activeItem = dessertItems[clickedIdx];
  const W = window.innerWidth;
  const H = window.innerHeight;
  
  // 計算畫面右側 1/3 處的核心聚焦座標 (約在 X = W * 0.68, Y = H * 0.5)
  const rightThirdX = W * 0.68;
  const rightThirdY = H * 0.5;

  // 1. 處理所有點心的過渡移動與聚焦
  dessertItems.forEach((item, idx) => {
    const el = item.element;
    
    if (idx === clickedIdx) {
      // 被選中的點心：再次放大至 1.75 倍！並順滑飛行至右方 1/3 處！
      el.classList.add('is-selected');
      el.classList.remove('is-dimmed');
      el.style.zIndex = '100';
      
      const targetPosX = rightThirdX - 80; // 卡片寬 160，半徑 80
      const targetPosY = rightThirdY - 80;
      
      el.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease';
      el.style.transform = `translate3d(${targetPosX}px, ${targetPosY}px, 0) scale(1.75)`;
    } else {
      // 其餘 9 個點心：退縮至左邊界或背景，半透明弱化
      el.classList.remove('is-selected');
      el.classList.add('is-dimmed');
      el.style.zIndex = '5';
      
      // 讓其他點心向左後方靠攏
      const bgX = (item.targetX * 0.45) - 40;
      const bgY = (item.targetY * 0.85);
      el.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease';
      el.style.transform = `translate3d(${bgX}px, ${bgY}px, 0) scale(0.65)`;
    }
  });

  // 2. 延遲 350ms (等點心快到達右側 1/3 處時)，才展開左側「文字詳細說明卡」！
  setTimeout(() => {
    showDessertInfoPanel(activeItem.data);
    document.getElementById('btn-reset-view').classList.remove('hidden');
  }, 350);
}

/**
 * 7. 顯示點心文字詳細說明卡
 */
function showDessertInfoPanel(data) {
  const panel = document.getElementById('info-panel');
  
  document.getElementById('info-badge').textContent = data.badge;
  document.getElementById('info-price').textContent = data.price;
  document.getElementById('info-title').textContent = data.name;
  document.getElementById('info-subtitle').textContent = data.subtitle;
  document.getElementById('info-desc').textContent = data.desc;
  
  // 更新風味指數長條圖
  document.getElementById('bar-sweetness').style.width = `${data.sweetness}%`;
  document.getElementById('bar-richness').style.width = `${data.richness}%`;
  document.getElementById('bar-texture').style.width = `${data.texture}%`;

  panel.classList.remove('hidden');
}

/**
 * 8. 返回全景總覽模式 (Reset View)
 */
function resetToPanoramaView() {
  selectedIndex = -1;
  document.getElementById('info-panel').classList.add('hidden');
  document.getElementById('btn-reset-view').classList.add('hidden');

  dessertItems.forEach((item) => {
    const el = item.element;
    el.classList.remove('is-selected', 'is-dimmed');
    el.style.zIndex = '10';
    
    const posX = item.targetX - 80;
    const posY = item.targetY - 80;
    
    el.style.transition = 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease';
    el.style.transform = `translate3d(${posX}px, ${posY}px, 0) scale(1)`;
  });
}

/**
 * 9. 監聽與控制台綁定
 */
function setupEventListeners() {
  // 重新播放進場
  document.getElementById('btn-replay').addEventListener('click', (e) => {
    e.stopPropagation();
    // 先把所有點心移回螢幕外的 startX, startY
    dessertItems.forEach((item) => {
      const el = item.element;
      el.style.transition = 'transform 0.4s ease, opacity 0.3s ease';
      el.style.opacity = '0';
      el.style.transform = `translate3d(${item.startX}px, ${item.startY}px, 0) scale(0.2)`;
    });
    
    setTimeout(() => {
      playEntranceAnimation();
    }, 250);
  });

  // 返回全景總覽按鈕
  document.getElementById('btn-reset-view').addEventListener('click', (e) => {
    e.stopPropagation();
    resetToPanoramaView();
  });
  
  document.getElementById('btn-close-info').addEventListener('click', (e) => {
    e.stopPropagation();
    resetToPanoramaView();
  });

  // 切換主題
  document.getElementById('btn-theme').addEventListener('click', (e) => {
    e.stopPropagation();
    document.body.classList.toggle('theme-light');
  });

  // 視窗大小改變時重新初始化佈局
  window.addEventListener('resize', () => {
    if (selectedIndex === -1) {
      initFullscreenStage();
      setTimeout(playEntranceAnimation, 100);
    }
  });
}
