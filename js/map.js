// ============================================================
// 《歐亞之國》
// 地圖控制系統 v0.1.5
// ============================================================

const MAP_FILE = "assets/world-map.svg";

// ------------------------------------------------------------
// 省份資料
// ------------------------------------------------------------

const provinces = {

    // ===== 西部 =====

    west_coast: {
        name: "西部沿海",
        terrain: "沿海丘陵",
        population: 520000,
        agriculture: 55,
        forestry: 65,
        mining: 35,
        fishing: 80,
        cities: ["西港", "海門"]
    },

    west_forest: {
        name: "西部森林",
        terrain: "森林",
        population: 430000,
        agriculture: 35,
        forestry: 90,
        mining: 55,
        fishing: 20,
        cities: ["林城"]
    },

    west_mountain: {
        name: "西部山地",
        terrain: "山地",
        population: 310000,
        agriculture: 25,
        forestry: 65,
        mining: 90,
        fishing: 10,
        cities: ["山城", "礦城"]
    },

    // ===== 北部 =====

    north_forest: {
        name: "北方森林",
        terrain: "寒冷森林",
        population: 380000,
        agriculture: 20,
        forestry: 85,
        mining: 60,
        fishing: 30,
        cities: ["北林"]
    },

    north_steppe: {
        name: "北方草原",
        terrain: "草原",
        population: 680000,
        agriculture: 45,
        forestry: 30,
        mining: 50,
        fishing: 15,
        cities: ["牧城", "北城"]
    },

    northeast_forest: {
        name: "東北森林",
        terrain: "寒冷森林",
        population: 420000,
        agriculture: 30,
        forestry: 80,
        mining: 65,
        fishing: 45,
        cities: ["東北城"]
    },

    // ===== 中部 =====

    upper_river: {
        name: "上河谷",
        terrain: "河谷平原",
        population: 780000,
        agriculture: 85,
        forestry: 40,
        mining: 35,
        fishing: 55,
        cities: ["上河城"]
    },

    central_plain: {
        name: "中央平原",
        terrain: "平原",
        population: 1200000,
        agriculture: 95,
        forestry: 30,
        mining: 40,
        fishing: 50,
        cities: ["王都", "平原城"]
    },

    lower_river: {
        name: "下河谷",
        terrain: "河流平原",
        population: 980000,
        agriculture: 90,
        forestry: 35,
        mining: 35,
        fishing: 75,
        cities: ["河城", "水都"]
    },

    central_steppe: {
        name: "中央草原",
        terrain: "大草原",
        population: 540000,
        agriculture: 35,
        forestry: 15,
        mining: 55,
        fishing: 10,
        cities: ["草原城"]
    },

    // ===== 東部 =====

    east_plain: {
        name: "東部平原",
        terrain: "沿海平原",
        population: 1050000,
        agriculture: 80,
        forestry: 45,
        mining: 50,
        fishing: 85,
        cities: ["東都", "平海"]
    },

    east_coast: {
        name: "東部海岸",
        terrain: "海岸",
        population: 620000,
        agriculture: 65,
        forestry: 35,
        mining: 45,
        fishing: 95,
        cities: ["海港", "東港"]
    },

    northeast_plain: {
        name: "東北平原",
        terrain: "草原與平原",
        population: 730000,
        agriculture: 70,
        forestry: 50,
        mining: 60,
        fishing: 45,
        cities: ["新城"]
    },

    // ===== 南部 =====

    south_highland: {
        name: "南方高地",
        terrain: "高原",
        population: 460000,
        agriculture: 35,
        forestry: 30,
        mining: 80,
        fishing: 15,
        cities: ["高原城"]
    },

    south_desert: {
        name: "南方荒漠",
        terrain: "沙漠",
        population: 260000,
        agriculture: 10,
        forestry: 5,
        mining: 90,
        fishing: 5,
        cities: ["沙城", "礦都"]
    },

    southeast_coast: {
        name: "東南海岸",
        terrain: "熱帶海岸",
        population: 580000,
        agriculture: 75,
        forestry: 70,
        mining: 40,
        fishing: 90,
        cities: ["南港", "海城"]
    },

    southeast_islands: {
        name: "東南群島",
        terrain: "群島",
        population: 210000,
        agriculture: 55,
        forestry: 65,
        mining: 30,
        fishing: 100,
        cities: ["島城"]
    }
};


// ------------------------------------------------------------
// 系統狀態
// ------------------------------------------------------------

let mapMount = null;
let svg = null;

let currentProvince = null;

let currentScale = 1;

let mapX = 0;
let mapY = 0;

let dragging = false;
let moved = false;

let pointerStartX = 0;
let pointerStartY = 0;

let startMapX = 0;
let startMapY = 0;

let pointerId = null;


// 地圖原始尺寸
const MAP_WIDTH = 2000;
const MAP_HEIGHT = 900;

// 縮放限制
const MIN_SCALE = 0.55;
const MAX_SCALE = 3;


// ------------------------------------------------------------
// 初始化
// ------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {

    mapMount = document.getElementById("mapMount");

    if (!mapMount) {
        console.error("找不到 #mapMount");
        return;
    }

    loadMap();

});


// ------------------------------------------------------------
// 載入 SVG 地圖
// ------------------------------------------------------------

async function loadMap() {

    try {

        const response = await fetch(MAP_FILE);

        if (!response.ok) {
            throw new Error(
                `地圖載入失敗：HTTP ${response.status}`
            );
        }

        const svgText = await response.text();

        mapMount.innerHTML = svgText;

        svg = mapMount.querySelector("svg");

        if (!svg) {
            throw new Error("world-map.svg 中找不到 SVG");
        }

        prepareSVG();

        prepareProvinces();

        setupDragging();

        setupZoom();

        setupButtons();

        requestAnimationFrame(() => {
            resetMap();
        });

        console.log("《歐亞之國》地圖載入完成");

    } catch (error) {

        console.error(error);

        mapMount.innerHTML = `
            <div style="
                padding:40px;
                color:#f5d7a0;
                text-align:center;
                font-family:serif;
            ">
                <h2>地圖載入失敗</h2>
                <p>請確認：</p>
                <p>assets/world-map.svg 是否存在</p>
                <p>以及檔案名稱是否完全正確。</p>
            </div>
        `;
    }

}


// ------------------------------------------------------------
// 設定 SVG
// ------------------------------------------------------------

function prepareSVG() {

    svg.setAttribute("width", MAP_WIDTH);
    svg.setAttribute("height", MAP_HEIGHT);

    svg.setAttribute(
        "viewBox",
        `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`
    );

    svg.style.width = `${MAP_WIDTH}px`;
    svg.style.height = `${MAP_HEIGHT}px`;

    svg.style.position = "absolute";
    svg.style.left = "0";
    svg.style.top = "0";

    svg.style.transformOrigin = "0 0";

    svg.style.userSelect = "none";

}


// ------------------------------------------------------------
// 省份設定
// ------------------------------------------------------------

function prepareProvinces() {

    const provinceElements =
        svg.querySelectorAll(
            ".province[data-province]"
        );

    console.log(
        `找到 ${provinceElements.length} 個可操作省份`
    );

    provinceElements.forEach(province => {

        const id =
            province.dataset.province;

        if (!provinces[id]) {

            console.warn(
                `SVG 中的省份 ${id} 沒有對應資料`
            );

        }

        province.style.cursor = "pointer";

        province.addEventListener(
            "pointerdown",
            event => {

                event.stopPropagation();

            }
        );

        province.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                // 如果剛剛是拖曳，不執行點擊
                if (moved) {
                    return;
                }

                selectProvince(id);

            }
        );

    });

}


// ------------------------------------------------------------
// 選擇省份
// ------------------------------------------------------------

function selectProvince(id) {

    if (!provinces[id]) {
        console.warn(
            `不存在的省份：${id}`
        );
        return;
    }

    currentProvince = id;

    // 清除舊選取
    svg
        .querySelectorAll(".province.selected")
        .forEach(element => {
            element.classList.remove("selected");
        });

    // 找到新省份
    const element =
        svg.querySelector(
            `.province[data-province="${id}"]`
        );

    if (element) {

        element.classList.add("selected");

    }

    updateProvincePanel(
        provinces[id]
    );

}


// ------------------------------------------------------------
// 更新右側資訊面板
// ------------------------------------------------------------

function updateProvincePanel(data) {

    const title =
        document.getElementById("regionName");

    const terrain =
        document.getElementById("regionTerrain");

    const population =
        document.getElementById("regionPopulation");

    if (title) {
        title.textContent = data.name;
    }

    if (terrain) {
        terrain.textContent =
            `地形：${data.terrain}`;
    }

    if (population) {
        population.textContent =
            `人口：${data.population.toLocaleString()}`;
    }

    updateResource(
        "agriculture",
        data.agriculture
    );

    updateResource(
        "forestry",
        data.forestry
    );

    updateResource(
        "mining",
        data.mining
    );

    updateResource(
        "fishing",
        data.fishing
    );

}


// ------------------------------------------------------------
// 資源條
// ------------------------------------------------------------

function updateResource(type, value) {

    const bar =
        document.querySelector(
            `[data-resource="${type}"]`
        );

    if (!bar) return;

    bar.style.width =
        `${Math.max(0, Math.min(100, value))}%`;

}


// ------------------------------------------------------------
// 滑鼠拖曳
// ------------------------------------------------------------

function setupDragging() {

    mapMount.addEventListener(
        "pointerdown",
        event => {

            // 只接受滑鼠左鍵
            if (
                event.pointerType === "mouse" &&
                event.button !== 0
            ) {
                return;
            }

            dragging = true;
            moved = false;

            pointerId =
                event.pointerId;

            pointerStartX =
                event.clientX;

            pointerStartY =
                event.clientY;

            startMapX = mapX;
            startMapY = mapY;

            mapMount.classList.add(
                "dragging"
            );

            mapMount.setPointerCapture(
                pointerId
            );

        }
    );


    mapMount.addEventListener(
        "pointermove",
        event => {

            if (
                !dragging ||
                event.pointerId !== pointerId
            ) {
                return;
            }

            const dx =
                event.clientX -
                pointerStartX;

            const dy =
                event.clientY -
                pointerStartY;


            if (
                Math.abs(dx) > 5 ||
                Math.abs(dy) > 5
            ) {

                moved = true;

            }


            mapX =
                startMapX + dx;

            mapY =
                startMapY + dy;


            constrainMap();

            updateMapTransform();

        }
    );


    mapMount.addEventListener(
        "pointerup",
        finishDragging
    );

    mapMount.addEventListener(
        "pointercancel",
        finishDragging
    );

    mapMount.addEventListener(
        "lostpointercapture",
        finishDragging
    );

}


function finishDragging(event) {

    if (
        pointerId !== null &&
        event.pointerId !== pointerId
    ) {
        return;
    }

    dragging = false;

    mapMount.classList.remove(
        "dragging"
    );

    pointerId = null;

    // 稍微延遲清除 moved
    // 避免 pointerup 後 click 馬上觸發
    setTimeout(() => {

        moved = false;

    }, 0);

}


// ------------------------------------------------------------
// 滾輪縮放
// ------------------------------------------------------------

function setupZoom() {

    mapMount.addEventListener(
        "wheel",
        event => {

            event.preventDefault();

            const oldScale =
                currentScale;


            // 滾輪向上：放大
            // 滾輪向下：縮小

            const zoomAmount =
                event.deltaY < 0
                    ? 1.15
                    : 0.87;


            let newScale =
                currentScale *
                zoomAmount;


            newScale =
                Math.max(
                    MIN_SCALE,
                    Math.min(
                        MAX_SCALE,
                        newScale
                    )
                );


            if (
                newScale ===
                oldScale
            ) {
                return;
            }


            const rect =
                mapMount.getBoundingClientRect();


            // 滑鼠在畫面中的位置
            const mouseX =
                event.clientX -
                rect.left;

            const mouseY =
                event.clientY -
                rect.top;


            // 保持滑鼠指向的位置不動
            const ratio =
                newScale /
                oldScale;


            mapX =
                mouseX -
                (mouseX - mapX) *
                ratio;


            mapY =
                mouseY -
                (mouseY - mapY) *
                ratio;


            currentScale =
                newScale;


            constrainMap();

            updateMapTransform();

        },
        {
            passive: false
        }
    );

}


// ------------------------------------------------------------
// 地圖位置限制
// ------------------------------------------------------------

function constrainMap() {

    if (!mapMount) return;


    const viewWidth =
        mapMount.clientWidth;

    const viewHeight =
        mapMount.clientHeight;


    const scaledWidth =
        MAP_WIDTH *
        currentScale;

    const scaledHeight =
        MAP_HEIGHT *
        currentScale;


    // 如果地圖比視窗小，就置中
    if (
        scaledWidth <=
        viewWidth
    ) {

        mapX =
            (viewWidth -
                scaledWidth) /
            2;

    } else {

        const minX =
            viewWidth -
            scaledWidth;

        mapX =
            Math.min(
                0,
                Math.max(
                    minX,
                    mapX
                )
            );

    }


    if (
        scaledHeight <=
        viewHeight
    ) {

        mapY =
            (viewHeight -
                scaledHeight) /
            2;

    } else {

        const minY =
            viewHeight -
            scaledHeight;

        mapY =
            Math.min(
                0,
                Math.max(
                    minY,
                    mapY
                )
            );

    }

}


// ------------------------------------------------------------
// 套用地圖變形
// ------------------------------------------------------------

function updateMapTransform() {

    if (!svg) return;

    svg.style.transform =
        `translate(${mapX}px, ${mapY}px)
         scale(${currentScale})`;

}


// ------------------------------------------------------------
// 重置地圖
// ------------------------------------------------------------

function resetMap() {

    if (!mapMount) return;

    const viewWidth =
        mapMount.clientWidth;

    const viewHeight =
        mapMount.clientHeight;


    // 讓整張地圖大致塞進視窗
    const fitScale =
        Math.min(
            viewWidth / MAP_WIDTH,
            viewHeight / MAP_HEIGHT
        );


    currentScale =
        Math.max(
            MIN_SCALE,
            Math.min(
                1,
                fitScale
            )
        );


    const scaledWidth =
        MAP_WIDTH *
        currentScale;

    const scaledHeight =
        MAP_HEIGHT *
        currentScale;


    mapX =
        (viewWidth -
            scaledWidth) /
        2;

    mapY =
        (viewHeight -
            scaledHeight) /
        2;


    constrainMap();

    updateMapTransform();

}


// ------------------------------------------------------------
// 地圖控制按鈕
// ------------------------------------------------------------

function setupButtons() {

    // 放大
    const zoomIn =
        document.getElementById(
            "zoomIn"
        );

    // 縮小
    const zoomOut =
        document.getElementById(
            "zoomOut"
        );

    // 重置
    const reset =
        document.getElementById(
            "resetMap"
        );


    if (zoomIn) {

        zoomIn.addEventListener(
            "click",
            () => {

                zoomAtCenter(
                    1.2
                );

            }
        );

    }


    if (zoomOut) {

        zoomOut.addEventListener(
            "click",
            () => {

                zoomAtCenter(
                    0.83
                );

            }
        );

    }


    if (reset) {

        reset.addEventListener(
            "click",
            () => {

                resetMap();

            }
        );

    }

}


// ------------------------------------------------------------
// 按鈕縮放
// ------------------------------------------------------------

function zoomAtCenter(
    amount
) {

    const oldScale =
        currentScale;


    currentScale =
        Math.max(
            MIN_SCALE,
            Math.min(
                MAX_SCALE,
                currentScale *
                amount
            )
        );


    if (
        currentScale ===
        oldScale
    ) {
        return;
    }


    const centerX =
        mapMount.clientWidth /
        2;

    const centerY =
        mapMount.clientHeight /
        2;


    const ratio =
        currentScale /
        oldScale;


    mapX =
        centerX -
        (centerX - mapX) *
        ratio;


    mapY =
        centerY -
        (centerY - mapY) *
        ratio;


    constrainMap();

    updateMapTransform();

}


// ------------------------------------------------------------
// 視窗大小改變
// ------------------------------------------------------------

window.addEventListener(
    "resize",
    () => {

        if (!svg) return;

        constrainMap();

        updateMapTransform();

    }
);


// ------------------------------------------------------------
// 點擊地圖空白處
// ------------------------------------------------------------

document.addEventListener(
    "click",
    event => {

        if (!svg) return;

        const province =
            event.target.closest(
                ".province[data-province]"
            );


        // 點的是省份，不清除
        if (province) {
            return;
        }

    }
);


// ------------------------------------------------------------
// Debug
// ------------------------------------------------------------

window.EurasianMap = {

    reset: resetMap,

    zoomIn: () =>
        zoomAtCenter(1.2),

    zoomOut: () =>
        zoomAtCenter(0.83),

    select: selectProvince,

    getState: () => ({
        province: currentProvince,
        scale: currentScale,
        x: mapX,
        y: mapY
    })

};
