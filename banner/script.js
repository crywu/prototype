/**
 * ============================================================================
 * L'ARTISAN DOUX — 零重力錯落漂浮點心全景物理與狀態控制器 (極致改版 V5)
 * 解決點擊後「原地放大」問題，實現 100% 飛往畫面右側 1/3 與固定適合大小：
 * 
 * 💡 為什麼之前點擊會變成原地放大？
 * 因為零重力漂浮迴圈 (requestAnimationFrame) 每秒 60 次不斷設定 style.transition = 'none'，
 * 當點擊瞬間改為 CSS transition 時，部分瀏覽器會因為樣式快照衝突，只執行了縮放 (scale)
 * 而略過了座標移動 (translate3d)！
 * 
 * 🚀 核心解決方案：
 * 全面改用瀏覽器硬體加速的「Web Animations API (el.animate)」處理點擊聚焦！
 * 1. 【點擊後必定飛往畫面右邊 1/3】：
 *    設定起點 Keyframe 為「點心當前漂浮的座標 (currentX, currentY)」，
 *    終點 Keyframe 嚴格鎖定為「畫面右邊 1/3 核心座標 (W * 0.70, H * 0.50)」！
 *    無論點心原本在哪裡漂浮，點擊後都會一道弧線優雅「飛往畫面右側 1/3」！
 * 2. 【固定適合大小 (350px)】：
 *    在飛往右側 1/3 的飛行途中，自動將大小縮放固定為一致、完美的「350px × 350px」！
 * 3. 【然後顯示出文字】：
 *    當點心優雅滑翔定格於右側 1/3 後，左側主廚詳細說明卡與風味指數才會柔和展開顯示！
 * ============================================================================
 */

// 10 款去背點心資料庫
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
  console.log("【L'ARTISAN DOUX V5】啟動：Web Animations API 確保飛往畫面右邊 1/3 + 固定適合大小 350px");
  createBackgroundParticles();
  initFullscreenStage();
  setupEventListeners();
  
  // 延遲 150ms 啟動四面八方飛入進場
  setTimeout(() => {
    randomizeAndPlayEntrance();
  }, 150);

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
 * 2. 初始化 10 款去背甜點 DOM
 */
function initFullscreenStage() {
  const stage = document.getElementById('stage');
  stage.innerHTML = '';
  dessertItems = [];

  DESSERT_DATA.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'dessert-item';
    el.dataset.index = index;
    el.style.width = `160px`;
    el.style.height = `160px`;
    
    el.innerHTML = `
      <div class="dessert-card">
        <div class="dessert-img-wrap">
          ${item.svgArt}
        </div>
      </div>
    `;

    el.style.transform = `translate3d(-3000px, -3000px, 0) scale(1.0)`;
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
      homeX: 0, homeY: 0,
      currentX: 0, currentY: 0,
      vx: 0, vy: 0,
      baseSize: 160,
      startX: -3000, startY: -3000
    });
  });

  document.body.addEventListener('click', () => {
    if (selectedIndex !== -1) {
      resetToZeroGravityView();
    }
  });
}

/**
 * 3. 確保從「四面八方飛入」進場
 */
function randomizeAndPlayEntrance() {
  selectedIndex = -1;
  document.getElementById('info-panel').classList.add('hidden');
  document.getElementById('btn-reset-view').classList.add('hidden');

  const W = window.innerWidth;
  const H = window.innerHeight;

  // A. 【排列穿插交錯】：定義 10 個前後高低錯落、重疊交錯的佈局網格
  const staggeredPositions = [
    { x: W * 0.12, y: H * 0.18 }, // 左上高位
    { x: W * 0.28, y: H * 0.28 }, // 中左穿插
    { x: W * 0.16, y: H * 0.68 }, // 左下低位
    { x: W * 0.35, y: H * 0.75 }, // 中左下錯落
    { x: W * 0.42, y: H * 0.45 }, // 中央偏左焦點
    { x: W * 0.58, y: H * 0.38 }, // 中央偏右穿插
    { x: W * 0.72, y: H * 0.22 }, // 右上高位
    { x: W * 0.85, y: H * 0.32 }, // 右側邊界
    { x: W * 0.68, y: H * 0.72 }, // 右下低位
    { x: W * 0.82, y: H * 0.78 }  // 右下底端
  ];

  for (let i = staggeredPositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [staggeredPositions[i], staggeredPositions[j]] = [staggeredPositions[j], staggeredPositions[i]];
  }

  // B. 【四面八方外圍發射站】：設定距離螢幕邊界更遙遠的 10 個明確外圍方向！
  const outerSpawns = [
    { x: -1000, y: -800 },       // 0: 左上角天際
    { x: W * 0.3, y: -1000 },    // 1: 正上方天際 (左)
    { x: W * 0.7, y: -1000 },    // 2: 正上方天際 (右)
    { x: W + 1000, y: -800 },    // 3: 右上角天際
    { x: W + 1200, y: H * 0.4 }, // 4: 正右方深處
    { x: W + 1000, y: H + 800 }, // 5: 右下角天際
    { x: W * 0.7, y: H + 1000 }, // 6: 正下方深處 (右)
    { x: W * 0.3, y: H + 1000 }, // 7: 正下方深處 (左)
    { x: -1000, y: H + 800 },    // 8: 左下角天際
    { x: -1200, y: H * 0.5 }     // 9: 正左方深處
  ];

  for (let i = outerSpawns.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [outerSpawns[i], outerSpawns[j]] = [outerSpawns[j], outerSpawns[i]];
  }

  // C. 【每次飛入大小隨機不一】：打散洗牌尺寸庫
  const sizePool = [260, 240, 225, 210, 195, 180, 165, 150, 135, 120];
  for (let i = sizePool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sizePool[i], sizePool[j]] = [sizePool[j], sizePool[i]];
  }

  // D. 派發並使用 Web Animations API (el.animate) 執行進場動畫！
  dessertItems.forEach((item, idx) => {
    const el = item.element;
    el.classList.remove('is-selected', 'is-dimmed');

    const newSize = sizePool[idx];
    item.baseSize = newSize;
    el.style.width = `${newSize}px`;
    el.style.height = `${newSize}px`;

    const spawn = outerSpawns[idx];
    item.startX = spawn.x;
    item.startY = spawn.y;

    const targetPos = staggeredPositions[idx];
    const jitterX = (Math.random() - 0.5) * 40;
    const jitterY = (Math.random() - 0.5) * 40;
    item.homeX = targetPos.x + jitterX;
    item.homeY = targetPos.y + jitterY;
    const finalX = item.homeX - (newSize / 2);
    const finalY = item.homeY - (newSize / 2);

    const driftSpeed = 0.2 + Math.random() * 0.3;
    const driftAngle = Math.random() * Math.PI * 2;
    item.vx = Math.cos(driftAngle) * driftSpeed;
    item.vy = Math.sin(driftAngle) * driftSpeed;

    const keyframes = [
      { 
        transform: `translate3d(${item.startX}px, ${item.startY}px, 0) scale(1.0) rotate(${Math.random() * 40 - 20}deg)`, 
        opacity: 0 
      },
      { 
        transform: `translate3d(${finalX}px, ${finalY}px, 0) scale(1.0) rotate(0deg)`, 
        opacity: 1 
      }
    ];

    const anim = el.animate(keyframes, {
      duration: 1500,
      delay: idx * 65 + 30,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      fill: 'forwards'
    });

    anim.onfinish = () => {
      el.style.transform = `translate3d(${finalX}px, ${finalY}px, 0) scale(1.0)`;
      el.style.opacity = '1';
      el.style.zIndex = '10';
      item.currentX = finalX;
      item.currentY = finalY;
    };
  });
}

/**
 * 4. 零重力持續漂浮物理迴圈
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
        
        const maxDrift = 150;
        if (item.currentX < item.homeX - (item.baseSize/2) - maxDrift || item.currentX < 20 || 
            item.currentX > item.homeX - (item.baseSize/2) + maxDrift || item.currentX > W - item.baseSize - 20) {
          item.vx *= -1;
        }
        if (item.currentY < item.homeY - (item.baseSize/2) - maxDrift || item.currentY < 60 || 
            item.currentY > item.homeY - (item.baseSize/2) + maxDrift || item.currentY > H - item.baseSize - 20) {
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
 * 5. 懸浮互動 (Hover)：物理排斥
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
 * 7. 🔥 核心修正：點擊聚焦 (Click Select) — 使用 Web Animations API 確保 100% 飛往畫面右側 1/3 處！
 * 
 * 解決為什麼之前會在「原地放大」：
 * 因為零重力迴圈不斷干預 style.transform，單純設定 CSS transition 容易被吃掉座標移動。
 * 現在全面改用 `el.animate`！
 * 1. 起點：點心當前在空中漂浮的位置 (item.currentX, item.currentY)
 * 2. 終點：嚴格鎖定在「畫面右側 1/3 處 (W * 0.70, H * 0.50)」！
 * 3. 大小：動態計算 `350 / baseSize`，確保任何點心飛過來後，最終長寬一定完美固定在 350px × 350px！
 */
function handleClickSelect(clickedIdx) {
  selectedIndex = clickedIdx;
  const activeItem = dessertItems[clickedIdx];
  const W = window.innerWidth;
  const H = window.innerHeight;
  
  // 🔥 設定畫面右側 1/3 核心座標 (讓 350px 大小的甜點中心正好在右邊 1/3 處)
  const rightThirdCenterX = W * 0.70;
  const rightThirdCenterY = H * 0.50;
  
  // 🔥 期望所有甜點點擊後統一呈現的「適合黃金尺寸」(350px)
  const targetSuitableSize = 350;

  dessertItems.forEach((item, idx) => {
    const el = item.element;
    
    if (idx === clickedIdx) {
      el.classList.add('is-selected');
      el.classList.remove('is-dimmed');
      el.style.zIndex = '100';
      
      // 動態縮放率：確保最終顯示大小 exactly equal to 350px
      const uniformScale = targetSuitableSize / item.baseSize;
      
      // 計算左上角定位座標，使甜點中心對齊右側 1/3
      const targetPosX = rightThirdCenterX - (item.baseSize / 2);
      const targetPosY = rightThirdCenterY - (item.baseSize / 2);
      
      // 🔥 使用 el.animate 強制瀏覽器把甜點從 [當前漂浮位置] 飛往 [畫面右側 1/3 座標]！
      const anim = el.animate([
        { transform: `translate3d(${item.currentX}px, ${item.currentY}px, 0) scale(1.0)`, opacity: 1 },
        { transform: `translate3d(${targetPosX}px, ${targetPosY}px, 0) scale(${uniformScale})`, opacity: 1 }
      ], {
        duration: 850,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards'
      });

      anim.onfinish = () => {
        el.style.transform = `translate3d(${targetPosX}px, ${targetPosY}px, 0) scale(${uniformScale})`;
        el.style.opacity = '1';
        item.currentX = targetPosX;
        item.currentY = targetPosY;
      };

    } else {
      el.classList.remove('is-selected');
      el.classList.add('is-dimmed');
      el.style.zIndex = '5';
      
      const bgX = (item.homeX * 0.30) - 40;
      const bgY = (item.homeY * 0.85);
      
      // 其他未選中點心優雅退居左側背景
      const anim = el.animate([
        { transform: `translate3d(${item.currentX}px, ${item.currentY}px, 0) scale(1.0)`, opacity: 1 },
        { transform: `translate3d(${bgX}px, ${bgY}px, 0) scale(0.55)`, opacity: 0.28 }
      ], {
        duration: 850,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards'
      });

      anim.onfinish = () => {
        el.style.transform = `translate3d(${bgX}px, ${bgY}px, 0) scale(0.55)`;
        el.style.opacity = '0.28';
        item.currentX = bgX;
        item.currentY = bgY;
      };
    }
  });

  // 🔥 當甜點優雅滑翔至右邊 1/3 處後 (延遲 380ms)，左側的詳細說明與故事文字優雅展開！
  setTimeout(() => {
    showDessertInfoPanel(activeItem.data);
    document.getElementById('btn-reset-view').classList.remove('hidden');
  }, 380);
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
    
    // 從點擊位置飛回原本的零重力空間網格
    const anim = el.animate([
      { transform: `translate3d(${item.currentX}px, ${item.currentY}px, 0) scale(${el.style.transform.includes('scale(') ? el.style.transform.split('scale(')[1].split(')')[0] : 1})` },
      { transform: `translate3d(${item.homeX - (item.baseSize/2)}px, ${item.homeY - (item.baseSize/2)}px, 0) scale(1.0)`, opacity: 1 }
    ], {
      duration: 750,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      fill: 'forwards'
    });

    anim.onfinish = () => {
      const targetX = item.homeX - (item.baseSize/2);
      const targetY = item.homeY - (item.baseSize/2);
      el.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scale(1.0)`;
      el.style.opacity = '1';
      item.currentX = targetX;
      item.currentY = targetY;
    };
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
