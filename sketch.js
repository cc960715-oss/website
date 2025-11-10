/*
By Okazz
新增滑動選單功能與中央標題 (使用馬山正體) - 選單鎖定模式
(最終版本: IFRAME 佔螢幕 80% 並居中，新增 '單元一作品'、'單元一筆記' 與 '題目測驗' 連結)
新增功能：右側滑出選單 - 已加入圖片、個人資訊 (在選單項目前方)
*/
//顏色設定
let colors = ['#7fc8f8', '#ffe45e', '#ff6392', '#17bebb'];
let ctx;
let motions = [];
let motionClasses = [];
let sceneTimer = 0;
let maxT2 = 0; 
let resetTime = 0; 

// -----------------------------------
// 選單相關變數
// -----------------------------------
let menuWidth;
// 左側選單變數 (保持不變)
let menuStateX; 
let targetMenuX; 
let triggerZone = 50; 
const menuItems = ["單元一作品", "單元一筆記", "單元二作品", "單元二筆記","題目測驗", "關閉選單/筆記"]; 
let menuLocked = false; 

// ✨ 新增：右側選單變數
let rightMenuStateX; 
let targetRightMenuX; 
const rightTriggerZone = 50; 
const rightMenuItems = [ "關閉選單"]; // 右側選單項目
let rightMenuLocked = false; 

// ✨ 圖片變數 (使用您上傳的圖片)
let profileImg; // 使用 profileImg 來存放圖片

// ✨ 更新：個人資訊內容 (兩行格式)
const STUDENT_INFO = "姓名：張O芸\n學號：0035"; // 使用 '\n' 實現兩行顯示

// 🚩 字體變數：已更新為 'Ma Shan Zheng'
const BIAU_KAI_FONT = 'Ma Shan Zheng'; 

// 選單連結地圖
const MENU_LINKS = {
    "單元一作品": "https://cc960715-oss.github.io/-balloon/",
    "單元一筆記": "https://hackmd.io/@S4T5MKJKTv2-p0tlVJuczw/ry7eYO1hgl",
    "題目測驗": "https://cc960715-oss.github.io/20251028/"
};

// 新增：用於顯示外部網站的 iframe 元素
let contentIframe; 

// Iframe 目標尺寸變數
const IFRAME_SCALE = 0.8; // 佔螢幕的 80%

// ------------------------------------
// ✨ 標題文字動畫變數 (新增)
// ------------------------------------
let titleShiftY = 0; // 標題當前的 Y 軸偏移量
let targetTitleShiftY = 0; // 標題目標的 Y 軸偏移量
let titleAnimationTime = 0; // 追蹤動畫時間
const TITLE_JUMP_AMOUNT = -30; // 標題彈跳的最大偏移量 (負值向上)
const TITLE_ANIM_DURATION = 30; // 標題動畫持續時間（幀數）


// ------------------------------------
// 圖片載入 
// ------------------------------------
function preload() {
    // ⚠️ 請務必將 'your_image.jpg' 替換為您的圖片實際路徑！
    // 這裡使用了一個佔位圖，請自行替換為您的檔案名稱
    profileImg = loadImage('your_image.jpg'); 
}

function setup() {
    createCanvas(windowWidth, windowHeight); 
    rectMode(CENTER); 
    ctx = drawingContext; 
    
    // 初始化選單寬度和狀態
    menuWidth = width / 5;
    
    // 左側選單初始化 (在畫面左側隱藏)
    menuStateX = -menuWidth; 
    targetMenuX = -menuWidth;
    
    // ✨ 右側選單初始化 (在畫面右側隱藏)
    rightMenuStateX = width; 
    targetRightMenuX = width;
    
    textAlign(CENTER, CENTER);
    
    // 創建 IFRAME (使用 p5.dom)
    contentIframe = createElement('iframe');
    contentIframe.style('display', 'none'); 
    contentIframe.style('border', '4px solid #000000'); 
    contentIframe.style('z-index', 10); 
    contentIframe.parent(document.getElementById('defaultCanvas0').parentElement); 
    
    INIT();
    resetTime = maxT2; 
}

function draw() {
    // 1. 背景繪製與動畫更新
    background('#ffffffff'); 
    for (let m of motions) { 
        m.run(); 
    }
    
    // 動畫停止機制
    if (sceneTimer >= resetTime) {
        for (let m of motions) {
            m.run(); 
        }
    }
    
    let fadeOutTime = 30;
    let alph = 0; 
    if ((resetTime - fadeOutTime) < sceneTimer && sceneTimer < resetTime) {
        alph = map(sceneTimer, (resetTime - fadeOutTime), resetTime, 0, 255);
        background(255, alph); 
    }

    sceneTimer++;
    
    // 2. 選單邏輯
    updateMenu();
    drawMenu(); // 繪製左側選單
    drawRightMenu(); // ✨ 繪製右側選單 (包含圖片和個人資訊)
    
    // 3. 中央標題繪製
    drawTitle();
    
    // 4. 更新 iframe 佈局
    updateIframeLayout(); 
}

// ------------------------------------
// IFRAME 相關函式 
// ------------------------------------

/**
 * 更新 iframe 的位置和大小，使其佔螢幕 80% 並居中
 */
function updateIframeLayout() {
    if (contentIframe.style('display') === 'block') {
        
        let targetWidth = width * IFRAME_SCALE;
        let targetHeight = height * IFRAME_SCALE;

        // 計算左側選單實際露出的寬度
        let leftMenuExposed = max(0, menuStateX + menuWidth); 

        // ✨ 計算右側選單實際露出的寬度
        let rightMenuExposed = max(0, width - rightMenuStateX);

        // 可用空間的起始 x 位置
        let xStart = leftMenuExposed;
        
        // 可用空間的總寬度
        let availableWidth = width - leftMenuExposed - rightMenuExposed;
        
        // 計算新的居中位置： (起始 X) + (可用空間的一半) - (iframe 寬度的一半)
        let iframeX = xStart + availableWidth / 2 - targetWidth / 2;
        let iframeY = height / 2 - targetHeight / 2;
        
        // 設置 iframe 佈局
        contentIframe.position(iframeX, iframeY);
        contentIframe.size(targetWidth, targetHeight);
    }
}

/**
 * 執行選單項目對應的動作 (左右選單共用此函式)
 */
function executeMenuItemAction(item) {
    console.log("Clicked:", item); 
    
    // 處理「關閉選單/筆記」
    if (item === "關閉選單/筆記" || item === "關閉選單") {
        // 關閉左側
        targetMenuX = -menuWidth; 
        menuLocked = false;       
        // 關閉右側
        targetRightMenuX = width;
        rightMenuLocked = false;
        
        contentIframe.style('display', 'none'); 
        contentIframe.attribute('src', '');     
        
    } else if (MENU_LINKS[item]) {
        // 處理左側內容連結
        contentIframe.attribute('src', MENU_LINKS[item]); 
        contentIframe.style('display', 'block');          
        
        targetMenuX = -menuWidth; 
        menuLocked = false;
        
    } else {
        // 處理右側或其他未設定的連結
        targetRightMenuX = width;
        rightMenuLocked = false;
        alert(`點擊了：${item} (尚未設定連結)`);
    }
}

// ------------------------------------
// 互動與繪圖函式
// ------------------------------------

function mousePressed() {
    // 檢查是否點擊左側選單
    if (menuStateX > -menuWidth + 10) { 
        handleMenuClick(menuItems, menuStateX, menuWidth, true);
    }
    // ✨ 檢查是否點擊右側選單
    if (rightMenuStateX < width - 10) {
        handleMenuClick(rightMenuItems, rightMenuStateX, menuWidth, false);
    }
}

/**
 * 處理選單點擊事件 (通用函式)
 * @param {Array<string>} items - 選單項目列表
 * @param {number} menuX - 選單的當前 X 座標
 * @param {number} menuW - 選單寬度
 * @param {boolean} isLeft - 是否為左側選單
 */
function handleMenuClick(items, menuX, menuW, isLeft) {
    let itemHeight = height / 10;
    let padding = menuW * 0.1;
    
    // 計算右側選單的文字起始Y座標 (需要和 drawRightMenu 保持一致)
    let textStartY = padding; 
    if (!isLeft) {
        let imgPadding = menuW * 0.15;
        let infoPadding = menuW * 0.05; // 最小間隔
        let imgSize = menuW - 2 * imgPadding;
        let imgY = height * 0.1; 
        
        // 估算兩行文字所需高度
        let textLineHeight = menuW * 0.1; 
        let infoHeight = textLineHeight * 2; 

        // 重新計算選單項目的 Y 軸起始位置 (textStartY)
        // 1. 個人資訊起始 Y (在圖片正下方，間隔 infoPadding)
        let infoY = imgY + imgSize + infoPadding; 
        // 2. 分隔線 Y (資訊底部 + 間隔)
        let lineY = infoY + infoHeight + infoPadding; 
        // 3. 選單項目起始 Y (在分隔線之下，間隔 infoPadding)
        textStartY = lineY + infoPadding; 
    }

    for (let i = 0; i < items.length; i++) {
        let textY = (isLeft ? padding : textStartY) + i * itemHeight; // 調整Y軸計算

        // 計算點擊區域
        // 右側選單的點擊區域從左邊緣 0 開始，到右邊緣 menuW 結束
        let clickXStart = menuX + (isLeft ? padding : 0); 
        let clickXEnd = menuX + (isLeft ? menuW - padding : menuW); 

        // 點擊偵測區域以 textY 為中心，itemHeight 為高度
        if (mouseX > clickXStart && mouseX < clickXEnd &&
            mouseY > textY - itemHeight/4 && mouseY < textY + itemHeight/4 ) {
            
            executeMenuItemAction(items[i]);
            return;
        }
    }
}

/**
 * 繪製中央標題，並應用彈跳動畫。
 */
function drawTitle() {
    push();
    
    // 🚨 應用彈跳 Y 偏移量
    translate(0, titleShiftY); 
    
    textFont(BIAU_KAI_FONT);
    
    fill(255); 
    
    // 標題: 程式設計
    textSize(width * 0.05); 
    text("程式設計", width / 2, height / 2 - 40); 
    // 副標題: 關閉一邊選單後再開啟另一邊選單
    textSize(width * 0.03); 
    text("關閉一邊選單後再開啟另一邊選單", width / 2, height / 2 + 10);
    pop();
}

/**
 * 更新左右選單的狀態和位置，並觸發標題動畫。
 */
function updateMenu() {
    // 檢查左側選單狀態
    let prevMenuLocked = menuLocked;
    if (menuLocked) {
        targetMenuX = 0;
    } else {
        if (mouseX < triggerZone && !rightMenuLocked) { 
            targetMenuX = 0;
            if (menuStateX <= -menuWidth + 10) { 
                 menuLocked = true;
            }
        } else {
            targetMenuX = -menuWidth;
        }
    }

    menuStateX = lerp(menuStateX, targetMenuX, 0.1); 
    
    // 檢查右側選單狀態
    let prevRightMenuLocked = rightMenuLocked;
    if (rightMenuLocked) {
        targetRightMenuX = width - menuWidth;
    } else {
        if (mouseX > width - rightTriggerZone && !menuLocked) { 
            targetRightMenuX = width - menuWidth;
            if (rightMenuStateX >= width - 10) {
                rightMenuLocked = true;
            }
        } else {
            targetRightMenuX = width;
        }
    }
    
    rightMenuStateX = lerp(rightMenuStateX, targetRightMenuX, 0.1);
    
    
    // ------------------------------------
    // ✨ 標題動畫邏輯 (新增)
    // ------------------------------------
    let isMenuOpening = (menuLocked && !prevMenuLocked) || (rightMenuLocked && !prevRightMenuLocked);
    let isMenuClosing = (!menuLocked && prevMenuLocked) || (!rightMenuLocked && prevRightMenuLocked);
    
    // 當選單狀態發生變化時，重置並觸發動畫
    if (isMenuOpening || isMenuClosing) {
        titleAnimationTime = 1; // 從第 1 幀開始
        // 開啟時：目標 Y 偏移量為 TITLE_JUMP_AMOUNT (向上跳起)
        // 關閉時：目標 Y 偏移量為 0 (回到原位)
        targetTitleShiftY = (menuLocked || rightMenuLocked) ? TITLE_JUMP_AMOUNT : 0;
    }
    
    // 執行動畫
    if (titleAnimationTime > 0 && titleAnimationTime <= TITLE_ANIM_DURATION) {
        let n = norm(titleAnimationTime, 0, TITLE_ANIM_DURATION);
        
        // 使用 easeOutBounce 實現彈跳效果 (或使用 easeInBounce 實現先慢後彈)
        // 這裡使用 easeOutBounce 讓它從目標位置彈回來
        let easedN = easeOutBounce(n); 
        
        if (targetTitleShiftY === TITLE_JUMP_AMOUNT) {
            // 開啟選單 (向上彈跳)：從 0 移動到 TITLE_JUMP_AMOUNT，並利用彈跳 overshoot
            titleShiftY = lerp(0, TITLE_JUMP_AMOUNT, easedN);
        } else {
            // 關閉選單 (向下回彈)：從 TITLE_JUMP_AMOUNT 移動到 0，並利用彈跳 overshoot
            // 為了使關閉時也有回彈感，我們使用一個反向的 lerp
            titleShiftY = lerp(TITLE_JUMP_AMOUNT, 0, easedN); 
        }
        
        titleAnimationTime++;
    } else if (titleAnimationTime > TITLE_ANIM_DURATION) {
        // 確保動畫結束後停在目標位置
        titleShiftY = targetTitleShiftY;
        titleAnimationTime = 0;
    }
}


// ------------------------------------
// 左側選單繪圖 (字體已更新)
// ------------------------------------

function drawMenu() {
    push();
    
    translate(menuStateX, 0); 

    // 繪製選單背景
    noStroke();
    fill(255, 153); 
    rectMode(CORNER);
    rect(0, 0, menuWidth, height); 
    
    // 繪製選單項目（懸停效果）
    let itemHeight = height / 10;
    let padding = menuWidth * 0.1;
    let isHovering = false; 
    
    if (menuLocked || menuStateX > -menuWidth + 10) { 
        for (let i = 0; i < menuItems.length; i++) {
            let textY = padding + i * itemHeight;
            let itemXStart = padding;
            let itemXEnd = menuWidth - padding;
            
            let localMouseX = mouseX - menuStateX; 

            if (localMouseX > itemXStart && localMouseX < itemXEnd &&
                mouseY > textY - itemHeight/4 && mouseY < textY + itemHeight/4) {
                
                // 懸停時的背景效果
                fill(0, 50); 
                rect(0, textY - itemHeight/2, menuWidth, itemHeight);
                isHovering = true;
            }
        }
    }
    
    // 繪製文字
    fill(0); 
    textFont(BIAU_KAI_FONT);
    textSize(menuWidth * 0.1); 
    textAlign(LEFT, TOP); 

    for (let i = 0; i < menuItems.length; i++) {
        let textY = padding + i * itemHeight;
        text(menuItems[i], padding, textY);
    }
    
    // 懸停時顯示手型游標
    if (isHovering) {
        cursor(HAND);
    } else {
        cursor(ARROW);
    }

    pop();
}

// ------------------------------------
// 右側選單繪圖 (字體已更新，文字靠左對齊)
// ------------------------------------

function drawRightMenu() {
    push();
    
    translate(rightMenuStateX, 0); 

    // 繪製選單背景 (白色半透明)
    noStroke();
    fill(255, 153); 
    rectMode(CORNER);
    rect(0, 0, menuWidth, height); 
    
    let itemHeight = height / 10;
    let imgPadding = menuWidth * 0.15;
    let infoPadding = menuWidth * 0.05; // 用於微調間距
    let padding = menuWidth * 0.1; // 選單項目使用的左側間隔

    // 1. 繪製圖片 (在頂部)
    let imgSize = menuWidth - 2 * imgPadding;
    let imgY = height * 0.1; 
    
    if (profileImg) {
        imageMode(CORNER);
        image(profileImg, imgPadding, imgY, imgSize, imgSize); 
    }
    
    // 2. 繪製個人資訊 (在圖片正下方，文字靠左對齊)
    let infoY = imgY + imgSize + infoPadding; // 圖片底部 Y 加上 infoPadding 間隔
    
    // 估算兩行文字所需高度
    let textLineHeight = menuWidth * 0.1; 
    let infoHeight = textLineHeight * 2; 

    fill(0); 
    textFont(BIAU_KAI_FONT); // 使用新字體
    textSize(textLineHeight); 
    
    // 文字靠左對齊，X 座標設為 imgPadding (與圖片對齊)
    textAlign(LEFT, TOP); 
    
    // 繪製文字 (利用 p5.js text() 的自動換行特性)
    text(STUDENT_INFO, imgPadding, infoY, menuWidth - 2*imgPadding, infoHeight * 1.5); 

    
    // 3. 繪製分隔線
    stroke(0, 100);
    // 分隔線位置：資訊文字開始 (infoY) + 兩行文字高度 (infoHeight) + 間隔 (infoPadding)
    let lineY = infoY + infoHeight + infoPadding; 
    line(imgPadding, lineY, menuWidth - imgPadding, lineY);
    
    // 4. 繪製選單項目 (在分隔線下方)
    let textStartY = lineY + infoPadding; // 選單項目從分隔線下方間隔 infoPadding 開始
    let isHovering = false; 
    
    // 重設文字大小和對齊方式
    textSize(menuWidth * 0.1); 
    textAlign(LEFT, TOP); 

    if (rightMenuLocked || rightMenuStateX < width - 10) { 
        for (let i = 0; i < rightMenuItems.length; i++) {
            let textY = textStartY + i * itemHeight; 
            let itemXStart = 0;
            let itemXEnd = menuWidth;
            
            let localMouseX = mouseX - rightMenuStateX; 

            if (localMouseX > itemXStart && localMouseX < itemXEnd &&
                mouseY > textY - itemHeight/4 && mouseY < textY + itemHeight/4) {
                
                // 懸停時的背景效果
                fill(0, 50); 
                rect(0, textY - itemHeight/2, menuWidth, itemHeight);
                isHovering = true;
            }
        }
    }
    
    // 繪製選單文字
    fill(0); 
    for (let i = 0; i < rightMenuItems.length; i++) {
        let textY = textStartY + i * itemHeight; 
        // 將 X 座標設為 padding (與左側選單項目使用相同的間隔)
        text(rightMenuItems[i], padding, textY); 
    }
    
    // 懸停時顯示手型游標
    if (isHovering || (mouseX > rightMenuStateX && mouseX < width && rightMenuStateX < width)) {
        cursor(HAND);
    } else if (menuLocked || menuStateX > -menuWidth + 10) {
        // 讓左側選單的游標判斷可以繼續運作
    } else {
        cursor(ARROW);
    }

    pop();
}

// ------------------------------------
// 核心動畫類別 (維持使用彈跳緩動)
// ------------------------------------
function INIT() {
    sceneTimer = 0;
    maxT2 = 0; 
    motions = [];
    motionClasses = [Motion01, Motion02, Motion03, Motion04, Motion05];
    let drawingRegion = width * 0.75;
    let cellCount = 25;
    let cellSize = drawingRegion / cellCount;
    let clr = '#000000';
    for (let i = 0; i < cellCount; i++) {
        for (let j = 0; j < cellCount; j++) {
            let x = cellSize * j + (cellSize / 2) + (width - drawingRegion) / 2;
            let y = cellSize * i + (cellSize / 2) + (height - drawingRegion) / 2;
            let MotionClass = random(motionClasses);
            let t = -int(dist(x, y, width / 2, height / 2) * 0.7);
            
            let newMotion = new MotionClass(x, y, cellSize, t, clr);
            motions.push(newMotion);
            
            let endTime = newMotion.t2 + abs(t);
            if (endTime > maxT2) {
                maxT2 = endTime;
            }
        }
    }
}

// ------------------------------------
// 彈跳緩動函式 (Bounce Easing Functions)
// ------------------------------------

/**
 * 標準的彈跳出 (Bounce Out) 緩動函式。
 * @param {number} x - 歸一化時間 (0 到 1)。
 * @returns {number} 歸一化值。
 */
function easeOutBounce(x) {
    const n1 = 7.5625;
    const d1 = 2.75;
    
    if (x < 1 / d1) {
        return n1 * x * x;
    } else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
}

/**
 * 彈跳入 (Bounce In) 緩動函式 (使用者提供)。
 * @param {number} x - 歸一化時間 (0 到 1)。
 * @returns {number} 歸一化值。
 */
function easeInBounce(x) {
    return 1 - easeOutBounce(1 - x);
}

// ------------------------------------
// Agent 類別 (維持使用新的緩動函式)
// ------------------------------------
class Agent {
    constructor(x, y, w, t, clr) {
        this.x = x;
        this.y = y;
        this.w = w;

        this.t1 = int(random(30, 100));
        this.t2 = this.t1 + int(random(30, 100));
        this.t = t;
        this.clr2 = color(clr);
        this.clr1 = color(random(colors));
        this.currentColor = this.clr1;
    }

    show() {
    }

    move() {
        if (0 < this.t && this.t < this.t1) {
            let n = norm(this.t, 0, this.t1 - 1);
            // 階段 1: 彈跳進入 (Bounce In)
            this.updateMotion1(easeInBounce(n)); 
        } else if (this.t1 < this.t && this.t < this.t2) {
            let n = norm(this.t, this.t1, this.t2 - 1);
            // 階段 2: 彈跳移出 (Bounce Out)
            this.updateMotion2(easeOutBounce(n)); 
        } else if (this.t >= this.t2) {
            this.updateMotion1(1);
            this.updateMotion2(1); 
            this.t = this.t2; 
        }
        this.t++;
    }

    run() {
        this.show();
        this.move();
    }

    updateMotion1(n) {

    }
    updateMotion2(n) {

    }

}

class Motion01 extends Agent {
    constructor(x, y, w, t, clr) {
        super(x, y, w, t, clr);
        this.shift = this.w * 3;
        this.ang = int(random(4)) * (TAU / 4);
        this.size = 0;
    }

    show() {
        noStroke();
        fill(this.currentColor);
        square(this.x + this.shift * cos(this.ang), this.y + this.shift * sin(this.ang), this.size);
    }

    updateMotion1(n) {
        this.shift = lerp(this.w * 3, 0, n);
        this.size = lerp(0, this.w, n);
        this.currentColor = lerpColor(this.clr1, this.clr2, n);
    }
    updateMotion2(n) {
        this.shift = 0;
        this.size = this.w;
        this.currentColor = this.clr2; 
    }
}

class Motion02 extends Agent {
    constructor(x, y, w, t, clr) {
        super(x, y, w, t, clr);
        this.shift = this.w * 2;
        this.ang = int(random(4)) * (TAU / 4);
        this.size = 0;
        this.corner = this.w / 2;
    }

    show() {
        noStroke();
        fill(this.currentColor);
        square(this.x + this.shift * cos(this.ang), this.y + this.shift * sin(this.ang), this.size, this.corner);
    }

    updateMotion1(n) {
        this.shift = lerp(0, this.w * 2, n);
        this.size = lerp(0, this.w / 2, n);
    }

    updateMotion2(n) {
        this.size = lerp(this.w / 2, this.w, n);
        this.shift = lerp(this.w * 2, 0, n);
        this.corner = lerp(this.w / 2, 0, n);
        this.currentColor = lerpColor(this.clr1, this.clr2, n);
    }
}

class Motion03 extends Agent {
    constructor(x, y, w, t, clr) {
        super(x, y, w, t, clr);
        this.shift = this.w * 2;
        this.ang = 0;
        this.size = 0
    }

    show() {
        push();
        translate(this.x, this.y);
        rotate(this.ang);
        noStroke();
        fill(this.currentColor);
        square(0, 0, this.size);
        pop();
    }

    updateMotion1(n) {
        this.ang = lerp(0, TAU, n);
        this.size = lerp(0, this.w, n);
        this.currentColor = lerpColor(this.clr1, this.clr2, n);

    }
    updateMotion2(n) {
        this.ang = TAU;
        this.size = this.w;
        this.currentColor = this.clr2; 
    }
}

class Motion04 extends Agent {
    constructor(x, y, w, t, clr) {
        super(x, y, w, t, clr);
        this.shift = this.w * 2;
        this.ang = int(random(4)) * (TAU / 4);
        this.rot = PI;
        this.side = 0;
    }

    show() {
        push();
        translate(this.x, this.y);
        rotate(this.ang);
        translate(-this.w / 2, -this.w / 2);
        rotate(this.rot);
        fill(this.currentColor);
        rect(this.w / 2, (this.w / 2) - (this.w - this.side) / 2, this.w, this.side);
        pop();
    }

    updateMotion1(n) {
        this.side = lerp(0, this.w, n);
    }

    updateMotion2(n) {
        this.currentColor = lerpColor(this.clr1, this.clr2, n);
        this.rot = lerp(PI, 0, n);
    }
}

class Motion05 extends Agent {
    constructor(x, y, w, t, clr) {
        super(x, y, w, t, clr);
        this.shift = this.w / 2;
        this.size = 0;
    }

    show() {
        push();
        translate(this.x, this.y);
        for (let i = 0; i < 4; i++) {
            fill(this.currentColor);
            square((this.w / 4) + this.shift, (this.w / 4) + this.shift, this.size);
            rotate(TAU / 4);
        }
        pop();
    }

    updateMotion1(n) {
        this.size = lerp(0, this.w / 4, n);
    }

    updateMotion2(n) {
        this.currentColor = lerpColor(this.clr1, this.clr2, n);
        this.shift = lerp(this.w / 2, 0, n);
        this.size = lerp(this.w / 4, this.w / 2, n);

    }
}