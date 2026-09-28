/*
 * 歐亞之國
 * World Map Controller
 * v0.1.3
 */

const mapMount = document.getElementById("mapMount");

let currentProvince = null;

let currentScale = 1;

let mapX = 0;
let mapY = 0;

let dragging = false;

let dragStartX = 0;
let dragStartY = 0;

let startMapX = 0;
let startMapY = 0;

/* =========================
   省份資料
========================= */

const provinces = {

    west: {
        name: "西陸",
        terrain: "山地與森林",

        population: 620000,

        agriculture: 35,
        forestry: 90,
        mining: 75,
        fishing: 20,

        cities: [
            "西城",
            "林都"
        ]
    },

    central: {
        name: "中央河谷",
        terrain: "河流平原",

        population: 1450000,

        agriculture: 95,
        forestry: 35,
        mining: 40,
        fishing: 65,

        cities: [
            "王都",
            "河城"
        ]
    },

    east: {
        name: "東陸",
        terrain: "沿海平原",

        population: 1100000,

        agriculture: 70,
        forestry: 45,
        mining: 55,
        fishing: 90,

        cities: [
            "東都",
            "海港"
        ]
    },

    north: {
        name: "北方草原",
        terrain: "草原",

        population: 850000,

        agriculture: 45,
        forestry: 50,
        mining: 60,
        fishing: 25,

        cities: [
            "北城",
            "牧城"
        ]
    },

    south: {
        name: "南方高原",
        terrain: "乾燥高原",

        population: 480000,

        agriculture: 25,
        forestry: 20,
        mining: 85,
        fishing: 15,

        cities: [
            "南城",
            "礦城"
        ]
    }

};


/* =========================
   載入 SVG
========================= */

async function loadMap() {

    try {

        const response =
            await fetch("assets/world-map.svg");

        if (!response.ok) {
            throw new Error("world-map.svg 載入失敗");
        }

        const svgText =
            await response.text();

        mapMount.innerHTML = svgText;

        const svg =
            mapMount.querySelector("svg");

        if (!svg) {
            throw new Error("找不到 SVG");
        }

        prepareMap(svg);

    } catch (error) {

        console.error(error);

        mapMount.innerHTML = `
            <div style="
                color:#d6c8a9;
                text-align:center;
                padding:40px;
                font-family:sans-serif;
            ">
                <h2>世界地圖載入失敗</h2>
                <p>請確認 assets/world-map.svg 是否存在。</p>
            </div>
        `;
    }
}


/* =========================
   初始化地圖
========================= */

function prepareMap(svg) {

    /*
     * 目前 SVG 的五個區域
     * 先映射成遊戲中的省份。
     */

    const mapping = {
        "west-region": "west",
        "central-region": "central",
        "east-region": "east"
    };


    Object.entries(mapping).forEach(
        ([svgId, provinceId]) => {

            const element =
                svg.querySelector(`#${svgId}`);

            if (!element) return;

            element.classList.add("province");

            element.dataset.province =
                provinceId;

            element.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    selectProvince(provinceId);
                }
            );
        }
    );


    /*
     * 北方草原與南方高原
     * 目前是裝飾區。
     *
     * 下一版會正式拆成省份。
     */

    svg.addEventListener(
        "click",
        () => {
            clearProvince();
        }
    );
}


/* =========================
   選擇省份
========================= */

function selectProvince(id) {

    const data = provinces[id];

    if (!data) return;

    currentProvince = id;

    document
        .querySelectorAll(".province")
        .forEach(element => {

            element.classList.toggle(
                "selected",
                element.dataset.province === id
            );
        });


    document.getElementById(
        "provinceName"
    ).textContent = data.name;

    document.getElementById(
        "provinceTerrain"
    ).textContent = data.terrain;


    document.getElementById(
        "population"
    ).textContent =
        data.population.toLocaleString();


    updateBar(
        "agriculture",
        data.agriculture
    );

    updateBar(
        "forestry",
        data.forestry
    );

    updateBar(
        "mining",
        data.mining
    );

    updateBar(
        "fishing",
        data.fishing
    );


    const cityList =
        document.getElementById("cityList");

    cityList.innerHTML =
        data.cities
            .map(city =>
                `<div class="city">${city}</div>`
            )
            .join("");
}


/* =========================
   清除選擇
========================= */

function clearProvince() {

    currentProvince = null;

    document
        .querySelectorAll(".province")
        .forEach(element =>
            element.classList.remove("selected")
        );


    document.getElementById(
        "provinceName"
    ).textContent = "尚未選擇";

    document.getElementById(
        "provinceTerrain"
    ).textContent = "點擊地圖上的地區";


    document.getElementById(
        "population"
    ).textContent = "—";


    [
        "agriculture",
        "forestry",
        "mining",
        "fishing"
    ].forEach(id => {

        updateBar(id, 0);

    });


    document.getElementById(
        "cityList"
    ).innerHTML = `
        <div class="empty">
            選擇一個地區後，
            這裡會顯示城市資料。
        </div>
    `;
}


/* =========================
   資源條
========================= */

function updateBar(id, value) {

    const element =
        document.querySelector(
            `#${id} .bar-fill`
        );

    const number =
        document.querySelector(
            `#${id} .stat-value`
        );

    if (!element || !number) return;

    element.style.width =
        `${value}%`;

    number.textContent =
        value === 0 ? "—" : value;
}


/* =========================
   地圖縮放
========================= */

function zoomMap(amount) {

    currentScale += amount;

    currentScale =
        Math.max(
            0.8,
            Math.min(2.5, currentScale)
        );


    const svg =
        mapMount.querySelector("svg");

    if (!svg) return;

    svg.style.transform =
        `scale(${currentScale})`;
}


/* =========================
   按鈕
========================= */

document
    .getElementById("zoomIn")
    .addEventListener(
        "click",
        () => zoomMap(.15)
    );

document
    .getElementById("zoomOut")
    .addEventListener(
        "click",
        () => zoomMap(-.15)
    );

document
    .getElementById("resetMap")
    .addEventListener(
        "click",
        () => {

            currentScale = 1;

            const svg =
                mapMount.querySelector("svg");

            if (svg) {
                svg.style.transform =
                    "scale(1)";
            }
        }
    );


/* =========================
   啟動
========================= */

loadMap();
clearProvince();
