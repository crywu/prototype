/**
 * ============================================================================
 * L'ARTISAN DOUX — 零重力錯落漂浮點心全景物理與狀態控制器 (V3 徹底改版)
 * 解決「看起來像彈出」問題：
 * 1. 【四面八方飛入而非彈出】：移除先前起始 scale(0.1) 的錯誤設定！
 *    讓甜點一開始就在「螢幕外圍遙遠的天際 (半徑 > 1200px)」以「原大小 scale(1.0)」
 *    或「略大 scale(1.2)」的姿態，真刀真槍地從四面八方 (360度隨機方向) 飛越劃入畫面！
 * 2. 【每次飛入方向隨機不一】：每次進場或點擊「重新四面八方飛入」時，10款甜點自全螢幕
 *    外 360 度隨機角度飛入，每次飛行的方向與角度軌跡皆完全不同！
 * 3. 【每次飛入大小隨機不一】：每次進場時，系統實時為各甜點隨機洗牌重新指派尺寸
 *    (從 125px 小型點綴到 265px 前景巨星)，每次出場誰是巨星、誰是襯景皆完全隨機！
 * 4. 【去背純淨太空漂浮】：10款點心皆採用 100% 去背美食主體，無圓角方框，在畫面上
 *    往不同方向緩慢優雅持續移動 (Zero-G Drift)！
 * ============================================================================
 */

// 10 款去背點心資料庫 (包含名稱、價格、描述與高訂去背插畫)
const DESSERT_DATA = [
  {
    id: 'strawberry-dome',
    name: '皇室草莓香草聖布蕾',
    subtitle: 'Royal Strawberry Vanilla Dome',
    price: '$28',
    badge: '👑 主廚嚴選',
    desc: '甄選法國馬達加斯加頂級香草莢與日本福岡頂級甘王草莓，慢火蒸烤出如絲綢般細膩的香草布蕾，搭配酥脆法式千層餅底，在舌尖綻放層次豐富的微酸與濃郁甘甜。',
    sweetness: 80, richness: 90, texture: 95,
    svgArt: `<svg viewBox="0 0 200 200" class="dessert-img">
      <ellipse cx="100" cy="165" rx="80" ry="20" fill="#b45309" opacity="0.9"/>
      <ellipse cx="100" cy="160" rx="85" ry="18" fill="#f59e0b"/>
      <path d="M 25 160 Q 25 70 100 70 Q 175 70 175 160 Z" fill="url(#grad-dome)"/>
      <defs><linearGradient id="grad-dome" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#fff1f2"/><stop offset="100%" stop-color="#fda4af"/></linearGradient></defs>
      <polygon points="100,20 125,55 75,55" fill="#e11d48" rx="10"/>
      <circle cx="100" cy="45" r="22" fill="#be123c"/>
      <circle cx="93" cy="38" r="5" fill="#fff" opacity="0.6"/>
      <path d="M 90 22 Q 100 10 110 22 Z" fill="#10b981"/>
      <circle cx="118" cy="65" r="4" fill="#f59e0b"/>
      <circle cx="75" cy="80" r="3" fill="#f59e0b"/>
    </svg>`
  },
  {
    id: 'matcha-mille-feulle',
    name: '宇治抹茶千層酥',
    subtitle: 'Uji Matcha Mille-Feuille',
    price: '$18',
    badge: '🍃 京都人氣',
    desc: '採用日本京都百年茶舖特級宇治抹茶，經過 72 小時低溫發酵與手工摺疊 730 層起酥餅皮，濃郁抹茶甘苦與香醇紐西蘭天然發酵奶油完美平衡。',
    sweetness: 60, richness: 85, texture: 98,
    svgArt: `<svg viewBox="0 0 200 200" class="dessert-img">
      <polygon points="30,150 170,130 180,165 40,185" fill="#92400e"/>
      <polygon points="30,110 170,90 175,125 35,145" fill="#047857"/>
      <polygon points="30,70 170,50 172,85 32,105" fill="#92400e"/>
      <polygon points="30,30 170,10 170,45 30,65" fill="#10b981"/>
      <circle cx="90" cy="35" r="14" fill="#fff"/>
      <circle cx="120" cy="30" r="10" fill="#f59e0b"/>
    </svg>`
  },
  {
    id: 'caramel-macaron',
    name: '法式焦糖海鹽馬卡龍',
    subtitle: 'Caramel Sea Salt Macaron',
    price: '$14',
    badge: '✨ 甜蜜輕享',
    desc: '正宗巴黎工藝杏仁酥餅，外層薄脆內裡煙韌（Chewy），夾心採用法國布列塔尼鹽之花海鹽與手工焦糖奶油醬，甜鹹交織令人回味無窮。',
    sweetness: 90, richness: 75, texture: 88,
    svgArt: `<svg viewBox="0 0 200 200" class="dessert-img">
      <ellipse cx="100" cy="135" rx="75" ry="28" fill="#d97706"/>
      <ellipse cx="100" cy="130" rx="70" ry="22" fill="#f59e0b"/>
      <rect x="30" y="95" width="140" height="30" rx="15" fill="#fffbeb"/>
      <ellipse cx="100" cy="85" rx="75" ry="32" fill="#d97706"/>
      <ellipse cx="100" cy="78" rx="72" ry="25" fill="#fbbf24"/>
      <ellipse cx="75" cy="68" rx="25" ry="8" fill="#fff" opacity="0.4"/>
    </svg>`
  },
  {
    id: 'dark-lava-cake',
    name: '熔岩濃黑巧克力蛋糕',
    subtitle: 'Dark Molten Lava Cake',
    price: '$22',
    badge: '🍫 70% 濃郁',
    desc: '選用法國法芙娜（Valrhona）70% 瓜納拉單一產區黑巧克力，切開瞬間溫熱濃郁的黑巧克力熔岩緩緩流出，搭配頂部冰涼的手工香草冰淇淋。',
    sweetness: 70, richness: 98, texture: 90,
    svgArt: `<svg viewBox="0 0 200 200" class="dessert-img">
      <path d="M 40 160 L 50 80 L 150 80 L 160 160 Z" fill="#27150c"/>
      <ellipse cx="100" cy="160" rx="60" ry="18" fill="#1c0f0a"/>
      <ellipse cx="100" cy="80" rx="50" ry="15" fill="#451a03"/>
      <path d="M 85 85 Q 90 135 110 145 Q 120 120 125 85 Z" fill="#7c2d12"/>
      <circle cx="100" cy="55" r="30" fill="#fff"/>
      <circle cx="90" cy="45" r="8" fill="#fff" opacity="0.9"/>
      <path d="M 95 30 Q 110 15 125 30 Q 110 35 95 30 Z" fill="#10b981"/>
    </svg>`
  },
  {
    id: 'mango-tart',
    name: '香芒翡翠慕斯塔',
    subtitle: 'Mango Emerald Mousse Tart',
    price: '$20',
    badge: '🥭 季節限定',
    desc: '嚴選當季特級愛文芒果與阿文索芒果，搭配清爽薄荷椰香百香果慕斯與杏仁香脆塔皮，果香四溢、酸甜沁涼，是夏秋過渡之際的完美甜點。',
    sweetness: 75, richness: 70, texture: 92,
    svgArt: `<svg viewBox="0 0 200 200" class="dessert-img">
      <polygon points="30,130 170,130 150,170 50,170" fill="#b45309"/>
      <ellipse cx="100" cy="130" rx="70" ry="20" fill="#d97706"/>
      <rect x="55" y="90" width="35" height="35" rx="6" fill="#f59e0b" transform="rotate(12 55 90)"/>
      <rect x="95" y="80" width="40" height="40" rx="8" fill="#fbbf24" transform="rotate(-15 95 80)"/>
      <rect x="75" y="60" width="38" height="38" rx="6" fill="#d97706" transform="rotate(25 75 60)"/>
      <circle cx="115" cy="65" r="10" fill="#10b981"/>
      <circle cx="65" cy="115" r="5" fill="#10b981"/>
    </svg>`
  },
  {
    id: 'blueberry-cheesecake',
    name: '藍莓冰霜起司蛋糕',
    subtitle: 'Blueberry Frost Cheesecake',
    price: '$19',
    badge: '🫐 清爽微酸',
    desc: '澳洲頂級熟成奶油乳酪與野生藍莓果凍層相互交疊，底部為英國消化餅乾與發酵黃油混製酥底，口感輕盈綿密，酸甜奶香恰到好處。',
    sweetness: 65, richness: 88, texture: 85,
    svgArt: `<svg viewBox="0 0 200 200" class="dessert-img">
      <path d="M 30 150 L 170 150 L 160 80 L 40 80 Z" fill="#fef08a"/>
      <path d="M 30 165 L 170 165 L 170 150 L 30 150 Z" fill="#854d0e"/>
      <path d="M 40 80 L 160 80 L 150 65 L 50 65 Z" fill="#6366f1"/>
      <circle cx="80" cy="55" r="16" fill="#312e81"/>
      <circle cx="115" cy="58" r="18" fill="#4338ca"/>
      <circle cx="98" cy="45" r="14" fill="#3730a3"/>
      <circle cx="110" cy="52" r="4" fill="#fff" opacity="0.5"/>
    </svg>`
  },
  {
    id: 'classic-tiramisu',
    name: '經典義式提拉米蘇',
    subtitle: 'Classic Italian Tiramisu',
    price: '$21',
    badge: '☕ 醇厚濃香',
    desc: '傳承義大利非物質文化遺產配方，義式濃縮咖啡與現磨現釀馬沙拉調味酒浸泡手指餅乾，鋪上綿密豐盈的馬斯卡彭乳酪與可可粉，醇醉撩人。',
    sweetness: 65, richness: 92, texture: 90,
    svgArt: `<svg viewBox="0 0 200 200" class="dessert-img">
      <rect x="35" y="80" width="130" height="85" rx="8" fill="#fffbeb"/>
      <rect x="35" y="125" width="130" height="20" fill="#78350f"/>
      <rect x="35" y="80" width="130" height="15" fill="#451a03"/>
      <path d="M 35 80 Q 100 70 165 80 Z" fill="#27150c"/>
      <ellipse cx="100" cy="65" rx="15" ry="10" fill="#451a03" transform="rotate(-20 100 65)"/>
      <line x1="93" y1="65" x2="107" y2="65" stroke="#78350f" stroke-width="2"/>
    </svg>`
  },
  {
    id: 'rose-lychee-tart',
    name: '玫瑰荔枝覆盆子塔',
    subtitle: 'Rose Lychee Raspberry Tart',
    price: '$24',
    badge: '🌹 浪漫巴黎',
    desc: '致敬大師經典 Ispahan 靈感，在大馬士革玫瑰鮮奶油中嵌入清甜飽滿的玉荷包荔枝肉與鮮酸覆盆子，每一口都散發優雅迷人的花果香氣。',
    sweetness: 75, richness: 78, texture: 94,
    svgArt: `<svg viewBox="0 0 200 200" class="dessert-img">
      <circle cx="100" cy="110" r="70" fill="#fb7185"/>
      <circle cx="100" cy="110" r="55" fill="#fff0f2"/>
      <circle cx="100" cy="110" r="40" fill="#e11d48"/>
      <path d="M 100 70 Q 130 100 100 150 Q 70 100 100 70 Z" fill="#be123c" opacity="0.6"/>
      <circle cx="135" cy="85" r="12" fill="#fff"/>
      <circle cx="65" cy="135" r="10" fill="#fff"/>
    </svg>`
  },
  {
    id: 'earl-grey-crepe',
    name: '皇家伯爵茶千層蛋糕',
    subtitle: 'Royal Earl Grey Mille-Crepe',
    price: '$23',
    badge: '☕ 英倫紳士',
    desc: '選用川寧皇室皇家伯爵紅茶浸漬牛奶 24 小時，揉入手作極薄可麗餅皮，茶香深邃、佛手柑餘香縈繞，口感如絲綢般在口中輕柔消融。',
    sweetness: 60, richness: 82, texture: 96,
    svgArt: `<svg viewBox="0 0 200 200" class="dessert-img">
      <path d="M 30 160 L 170 160 L 150 70 L 50 70 Z" fill="#d97706"/>
      <line x1="33" y1="140" x2="167" y2="140" stroke="#fffbeb" stroke-width="4"/>
      <line x1="37" y1="120" x2="163" y2="120" stroke="#fffbeb" stroke-width="4"/>
      <line x1="42" y1="100" x2="158" y2="100" stroke="#fffbeb" stroke-width="4"/>
      <line x1="46" y1="80" x2="154" y2="80" stroke="#fffbeb" stroke-width="4"/>
      <path d="M 50 70 Q 100 55 150 70 Z" fill="#78350f"/>
      <circle cx="100" cy="50" r="14" fill="#f59e0b"/>
    </svg>`
  },
  {
    id: 'french-canele',
    name: '經典波爾多法式可麗露',
    subtitle: 'Classic Bordeaux Canelé',
    price: '$15',
    badge: '🔔 天使之鈴',
    desc: '波爾多百年傳統銅模烤製，外層披覆著深褐色焦香焦糖脆殼，內裡卻是Q彈濕潤、飽含大溪地香草與陳年陳釀蘭姆酒香氣的蜂巢狀糕體。',
    sweetness: 70, richness: 85, texture: 99,
    svgArt: `<svg viewBox="0 0 200 200" class="dessert-img">
      <path d="M 50 60 L 150 60 L 165 155 L 35 155 Z" fill="#451a03" rx="10"/>
      <path d="M 50 60 Q 100 40 150 60 Z" fill="#27150c"/>
      <line x1="70" y1="60" x2="65" y2="155" stroke="#78350f" stroke-width="6"/>
      <line x1="100" y1="58" x2="100" y2="155" stroke="#78350f" stroke-width="6"/>
      <line x1="130" y1="60" x2="135" y2="155" stroke="#78350f" stroke-width="6"/>
      <ellipse cx="90" cy="70" rx="15" ry="5" fill="#fff" opacity="0.3"/>
    </svg>`
  }
];

// 物理引擎與狀態管理
let dessertItems = [];
let selectedIndex = -1;
let isHovering = false;
let isDrifting = true;
let animFrameId = null;

// 頁面初始化
document.addEventListener('DOMContentLoaded', () => {
  createBackgroundParticles();
  initFullscreenStage();
  setupEventListeners();
  
  // 延遲 200ms 啟動【真正四面八方飛入 + 隨機大小洗牌】
  setTimeout(() => {
    randomizeAndPlayEntrance();
  }, 200);

  startZeroGravityDriftLoop();
});

/**
 * 1. 產生背景星屑
 */
function createBackgroundParticles() {
  const container = document.getElementById('particles-container');
  const count = 35;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 2;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${Math.random() * 100}vw`;
    p.style.animationDuration = `${Math.random() * 16 + 12}s`;
    p.style.animationDelay = `${Math.random() * -20}s`;
    container.appendChild(p);
  }
}

/**
 * 2. 初始化 10 款去背甜點的 DOM 構建與基本空間分佈
 */
function initFullscreenStage() {
  const stage = document.getElementById('stage');
  stage.innerHTML = '';
  dessertItems = [];

  const W = window.innerWidth;
  const H = window.innerHeight;

  DESSERT_DATA.forEach((item, index) => {
    const col = index % 5;
    const row = Math.floor(index / 5);
    
    // 計算空間網格與隨機有機偏移
    const marginX = W * 0.08;
    const marginY = H * 0.18;
    const stepX = (W - marginX * 2) / 4;
    const stepY = (H - marginY * 2 - 50) / 1;
    
    const jitterX = (Math.random() - 0.5) * 80;
    const jitterY = (Math.random() - 0.5) * 60;
    
    const homeX = marginX + col * stepX + jitterX;
    const homeY = marginY + row * stepY + jitterY;

    const baseSize = 160; // 將在每次進場時動態隨機洗牌

    const el = document.createElement('div');
    el.className = 'dessert-item';
    el.dataset.index = index;
    el.style.width = `${baseSize}px`;
    el.style.height = `${baseSize}px`;
    
    // 渲染卡片：完全無邊框無背景，只有去背主體
    el.innerHTML = `
      <div class="dessert-card">
        <div class="dessert-img-wrap">
          ${item.svgArt}
        </div>
      </div>
    `;

    // 初始位置放置在遙遠螢幕外，且 scale(1.0) 不縮小！
    el.style.transform = `translate3d(-1500px, -1500px, 0) scale(1.0)`;
    el.style.opacity = '0';

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
      homeX, homeY,
      currentX: homeX, currentY: homeY,
      vx: 0, vy: 0,
      baseSize: baseSize,
      startX: -1500, startY: -1500
    });
  });

  document.body.addEventListener('click', () => {
    if (selectedIndex !== -1) {
      resetToZeroGravityView();
    }
  });
}

/**
 * 3. 🔥 核心修正：真正四面八方「飛入 (Swoop-In)」與隨機大小洗牌！
 * 解決為什麼看起來像彈出：
 * 以前起始時設定了 `scale(0.1)`，所以看起像原地氣泡彈出！
 * 現在起始時設定為 `scale(1.15)` 搭配遙遠的螢幕外座標 (距離 > 1300px)，
 * 這樣您會明確看到 10 款巨大精美的甜點從上、下、左、右、斜角等 360 度真實「飛越劃入」螢幕！
 */
function randomizeAndPlayEntrance() {
  selectedIndex = -1;
  document.getElementById('info-panel').classList.add('hidden');
  document.getElementById('btn-reset-view').classList.add('hidden');

  const W = window.innerWidth;
  const H = window.innerHeight;
  const centerW = W / 2;
  const centerH = H / 2;
  // 飛行起始半徑大幅增加，確保一開始絕對在視窗更外圍！
  const flyRadius = Math.max(W, H) * 0.85 + 400; 

  // A. 建立 10 個隨機錯落的尺寸庫，並打散洗牌 (Fisher-Yates Shuffle)
  const sizePool = [265, 245, 230, 215, 200, 185, 170, 155, 140, 125];
  for (let i = sizePool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sizePool[i], sizePool[j]] = [sizePool[j], sizePool[i]];
  }

  // B. 為每個點心分配新尺寸、隨機 360 度飛入角度與新漂浮速度
  dessertItems.forEach((item, idx) => {
    const el = item.element;
    el.classList.remove('is-selected', 'is-dimmed');

    // 1. 更新隨機尺寸
    const newSize = sizePool[idx];
    item.baseSize = newSize;
    el.style.width = `${newSize}px`;
    el.style.height = `${newSize}px`;

    // 2. 隨機 360 度外圍飛行角度 (真·四面八方)
    const randomAngle = Math.random() * Math.PI * 2;
    item.startX = centerW + Math.cos(randomAngle) * flyRadius;
    item.startY = centerH + Math.sin(randomAngle) * flyRadius;

    // 3. 隨機新漂浮速度向量
    const driftSpeed = 0.2 + Math.random() * 0.3;
    const driftAngle = Math.random() * Math.PI * 2;
    item.vx = Math.cos(driftAngle) * driftSpeed;
    item.vy = Math.sin(driftAngle) * driftSpeed;

    // 4. 隨機微調著陸點
    const jitterX = (Math.random() - 0.5) * 60;
    const jitterY = (Math.random() - 0.5) * 50;
    const targetX = item.homeX + jitterX - (newSize / 2);
    const targetY = item.homeY + jitterY - (newSize / 2);

    // 🔥 關鍵修正：起始位置不要縮小至 0.1！維持 1.15 倍大尺寸，確保看起來是「從遠方飛過來」而非「氣泡彈出」！
    el.style.transition = 'none';
    el.style.opacity = '0';
    el.style.transform = `translate3d(${item.startX}px, ${item.startY}px, 0) scale(1.15) rotate(${Math.random() * 50 - 25}deg)`;

    // 延遲執行飛越劃入
    setTimeout(() => {
      el.style.transition = 'transform 1.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.8s ease';
      el.style.opacity = '1';
      el.style.zIndex = '10';
      el.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scale(1) rotate(0deg)`;
      item.currentX = targetX;
      item.currentY = targetY;
    }, idx * 70 + 30);
  });
}

/**
 * 4. 零重力持續漂浮物理迴圈 (Zero-Gravity Continuous Drift)
 */
function startZeroGravityDriftLoop() {
  function loop() {
    if (isDrifting && selectedIndex === -1 && !isHovering) {
      const W = window.innerWidth;
      const H = window.innerHeight;

      dessertItems.forEach((item) => {
        const el = item.element;
        
        item.currentX += item.vx;
        item.currentY += item.vy;
        
        const maxDrift = 160;
        if (item.currentX < item.homeX - maxDrift || item.currentX < 20 || 
            item.currentX > item.homeX + maxDrift || item.currentX > W - item.baseSize - 20) {
          item.vx *= -1;
        }
        if (item.currentY < item.homeY - maxDrift || item.currentY < 60 || 
            item.currentY > item.homeY + maxDrift || item.currentY > H - item.baseSize - 20) {
          item.vy *= -1;
        }

        el.style.transition = 'none';
        el.style.transform = `translate3d(${item.currentX}px, ${item.currentY}px, 0) scale(1)`;
      });
    }
    animFrameId = requestAnimationFrame(loop);
  }
  loop();
}

/**
 * 5. 懸浮互動 (Hover)：主體放大與物理推開
 */
function handleHover(hoverIdx) {
  if (selectedIndex !== -1) return;
  isHovering = true;
  
  const activeItem = dessertItems[hoverIdx];
  const activeCenterX = activeItem.currentX + (activeItem.baseSize / 2);
  const activeCenterY = activeItem.currentY + (activeItem.baseSize / 2);

  dessertItems.forEach((item, idx) => {
    const el = item.element;
    const basePosX = item.currentX;
    const basePosY = item.currentY;

    if (idx === hoverIdx) {
      el.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
      el.style.transform = `translate3d(${basePosX}px, ${basePosY}px, 0) scale(1.38)`;
      el.style.zIndex = '60';
    } else {
      const itemCenterX = item.currentX + (item.baseSize / 2);
      const itemCenterY = item.currentY + (item.baseSize / 2);
      const dx = itemCenterX - activeCenterX;
      const dy = itemCenterY - activeCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxRadius = 650;

      if (dist < maxRadius && dist > 0) {
        const force = Math.pow((maxRadius - dist) / maxRadius, 1.3) * 75;
        const pushX = (dx / dist) * force;
        const pushY = (dy / dist) * force;
        
        el.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)';
        el.style.transform = `translate3d(${basePosX + pushX}px, ${basePosY + pushY}px, 0) scale(0.9)`;
        el.style.zIndex = '10';
      }
    }
  });
}

/**
 * 6. 滑鼠移出：恢復漂浮
 */
function handleLeave() {
  if (selectedIndex !== -1) return;
  isHovering = false;

  dessertItems.forEach((item) => {
    const el = item.element;
    el.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    el.style.transform = `translate3d(${item.currentX}px, ${item.currentY}px, 0) scale(1)`;
    el.style.zIndex = '10';
  });
}

/**
 * 7. 點擊聚焦 (Click Select)：主角放大並移至右 1/3
 */
function handleClickSelect(clickedIdx) {
  selectedIndex = clickedIdx;
  const activeItem = dessertItems[clickedIdx];
  const W = window.innerWidth;
  const H = window.innerHeight;
  
  const rightThirdX = W * 0.68;
  const rightThirdY = H * 0.5;

  dessertItems.forEach((item, idx) => {
    const el = item.element;
    
    if (idx === clickedIdx) {
      el.classList.add('is-selected');
      el.classList.remove('is-dimmed');
      el.style.zIndex = '100';
      
      const targetPosX = rightThirdX - (item.baseSize / 2);
      const targetPosY = rightThirdY - (item.baseSize / 2);
      
      el.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease';
      el.style.transform = `translate3d(${targetPosX}px, ${targetPosY}px, 0) scale(1.85)`;
    } else {
      el.classList.remove('is-selected');
      el.classList.add('is-dimmed');
      el.style.zIndex = '5';
      
      const bgX = (item.homeX * 0.38) - 30;
      const bgY = (item.homeY * 0.85);
      el.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease';
      el.style.transform = `translate3d(${bgX}px, ${bgY}px, 0) scale(0.58)`;
    }
  });

  setTimeout(() => {
    showDessertInfoPanel(activeItem.data);
    document.getElementById('btn-reset-view').classList.remove('hidden');
  }, 350);
}

/**
 * 8. 顯示詳細說明卡
 */
function showDessertInfoPanel(data) {
  const panel = document.getElementById('info-panel');
  document.getElementById('info-badge').textContent = data.badge;
  document.getElementById('info-price').textContent = data.price;
  document.getElementById('info-title').textContent = data.name;
  document.getElementById('info-subtitle').textContent = data.subtitle;
  document.getElementById('info-desc').textContent = data.desc;
  
  document.getElementById('bar-sweetness').style.width = `${data.sweetness}%`;
  document.getElementById('bar-richness').style.width = `${data.richness}%`;
  document.getElementById('bar-texture').style.width = `${data.texture}%`;

  panel.classList.remove('hidden');
}

/**
 * 9. 返回零重力漂浮總覽
 */
function resetToZeroGravityView() {
  selectedIndex = -1;
  document.getElementById('info-panel').classList.add('hidden');
  document.getElementById('btn-reset-view').classList.add('hidden');

  dessertItems.forEach((item) => {
    const el = item.element;
    el.classList.remove('is-selected', 'is-dimmed');
    el.style.zIndex = '10';
    
    el.style.transition = 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease';
    el.style.transform = `translate3d(${item.currentX}px, ${item.currentY}px, 0) scale(1)`;
  });
}

/**
 * 10. 事件綁定
 */
function setupEventListeners() {
  document.getElementById('btn-replay').addEventListener('click', (e) => {
    e.stopPropagation();
    randomizeAndPlayEntrance();
  });

  document.getElementById('btn-toggle-drift').addEventListener('click', (e) => {
    e.stopPropagation();
    isDrifting = !isDrifting;
    const btn = document.getElementById('btn-toggle-drift');
    btn.querySelector('span').textContent = isDrifting ? '漂浮中 (暫停)' : '已暫停 (繼續漂浮)';
  });

  document.getElementById('btn-reset-view').addEventListener('click', (e) => {
    e.stopPropagation();
    resetToZeroGravityView();
  });
  
  document.getElementById('btn-close-info').addEventListener('click', (e) => {
    e.stopPropagation();
    resetToZeroGravityView();
  });

  document.getElementById('btn-theme').addEventListener('click', (e) => {
    e.stopPropagation();
    document.body.classList.toggle('theme-light');
  });

  window.addEventListener('resize', () => {
    if (selectedIndex === -1) {
      initFullscreenStage();
      setTimeout(randomizeAndPlayEntrance, 100);
    }
  });
}
