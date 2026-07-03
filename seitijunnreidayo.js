// ==========================================
// Mapbox アクセストークン
// ==========================================

mapboxgl.accessToken = "pk.eyJ1Ijoia3Vyb211IiwiYSI6ImNtcDBqcGpjNjB3Y2EycnE2a3d6cGhmbG4ifQ.lQ-HQ1PQVvgpxSvj8J_9rA";

// ==========================================
// 状態管理
// ==========================================

let is3D = false;
let marker = null;

// ==========================================
// 地図作成
// ==========================================

const map = new mapboxgl.Map({

    container: "map",

    style: "mapbox://styles/mapbox/standard",

    center: [139.767125, 35.681236],

    zoom: 14,

    pitch: 0,

    bearing: 0,

    antialias: true,

    config: {

        basemap: {

            language: "ja",

            theme: "default",

            lightPreset: "day",

            showPointOfInterestLabels: true,

            showRoadLabels: false,

            showPlaceLabels: true,

            showTransitLabels: true

        }

    }

});

// ==========================================
// ナビゲーション
// ==========================================

map.addControl(

    new mapboxgl.NavigationControl({

        visualizePitch: true

    }),

    "top-right"

);

// ==========================================
// 現在地
// ==========================================

const geolocate = new mapboxgl.GeolocateControl({

    positionOptions: {

        enableHighAccuracy: true

    },

    trackUserLocation: true,

    showUserHeading: true

});

map.addControl(geolocate);

// ==========================================
// 読み込み完了
// ==========================================

map.on("load", () => {

    document.getElementById("loading").style.display = "none";

});

// ==========================================
// 検索ボックス
// ==========================================

window.addEventListener("load", () => {

    const searchBox = new mapboxsearch.MapboxSearchBox();

    searchBox.accessToken = mapboxgl.accessToken;

    searchBox.mapboxgl = mapboxgl;

    searchBox.placeholder = "場所・住所・駅名を検索";

    searchBox.options = {

        language: "ja",

        country: "JP"

    };

    document
        .getElementById("search-box")
        .appendChild(searchBox);

    searchBox.addEventListener("retrieve", (event) => {

        const feature = event.detail.features[0];

        if (!feature) return;

        const lng = feature.geometry.coordinates[0];
        const lat = feature.geometry.coordinates[1];

        map.flyTo({

            center: [lng, lat],

            zoom: 16,

            speed: 1.2

        });

        if (marker) {

            marker.remove();

        }

        marker = new mapboxgl.Marker({

            color: "#ff0000"

        })
            .setLngLat([lng, lat])
            .addTo(map);

    });

});

// ==========================================
// 現在地ボタン
// ==========================================

document
    .getElementById("currentLocation")
    .addEventListener("click", () => {

        geolocate.trigger();

    });

// ==========================================
// 2D / 3D切替
// ==========================================

document
    .getElementById("toggle3D")
    .addEventListener("click", () => {

        if (!is3D) {

            map.easeTo({

                pitch: 70,

                bearing: -20,

                duration: 1500

            });

            document.getElementById("toggle3D").textContent = "🗺️ 2D表示";

            is3D = true;

        } else {

            map.easeTo({

                pitch: 0,

                bearing: 0,

                duration: 1500

            });

            document.getElementById("toggle3D").textContent = "🏙️ 3D表示";

            is3D = false;

        }

    });


// ==========================================
// 地図クリックでマーカー設置
// ==========================================

map.on("click", (e) => {

    const lng = e.lngLat.lng;
    const lat = e.lngLat.lat;

    // 座標表示
    document.getElementById("lng").textContent = lng.toFixed(6);
    document.getElementById("lat").textContent = lat.toFixed(6);

    // 既存マーカー削除
    if (marker) {
        marker.remove();
    }

    // 新しいマーカー
    marker = new mapboxgl.Marker({
        color: "#ff3b30",
        draggable: true
    })
    .setLngLat([lng, lat])
    .setPopup(
        new mapboxgl.Popup({
            offset: 25
        }).setHTML(`
            <h3>選択した場所</h3>
            <p>緯度：${lat.toFixed(6)}</p>
            <p>経度：${lng.toFixed(6)}</p>
        `)
    )
    .addTo(map);

    marker.togglePopup();

    // ドラッグ後も座標更新
    marker.on("dragend", () => {

        const pos = marker.getLngLat();

        document.getElementById("lng").textContent =
            pos.lng.toFixed(6);

        document.getElementById("lat").textContent =
            pos.lat.toFixed(6);

        marker.setPopup(
            new mapboxgl.Popup({
                offset: 25
            }).setHTML(`
                <h3>選択した場所</h3>
                <p>緯度：${pos.lat.toFixed(6)}</p>
                <p>経度：${pos.lng.toFixed(6)}</p>
            `)
        );

    });

});

// ==========================================
// 北を上に戻す
// ==========================================

document
.getElementById("resetNorth")
.addEventListener("click", () => {

    map.easeTo({

        bearing: 0,

        duration: 1000

    });

});

// ==========================================
// マウス座標表示
// ==========================================

map.on("mousemove",(e)=>{

    document.getElementById("lng").textContent =
        e.lngLat.lng.toFixed(6);

    document.getElementById("lat").textContent =
        e.lngLat.lat.toFixed(6);

});

// ==========================================
// 地図ロード後の設定
// ==========================================

map.on("idle",()=>{

    console.log("地図の読み込み完了");

});

// ==========================================
// ESCキーでポップアップを閉じる
// ==========================================

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        if(marker){

            marker.getPopup().remove();

        }

    }

});

// ==========================================
// スマホで長押しでもマーカー設置
// ==========================================

let pressTimer;

const canvas = map.getCanvas();

canvas.addEventListener("touchstart",(event)=>{

    pressTimer = setTimeout(()=>{

        const touch = event.touches[0];

        const rect = canvas.getBoundingClientRect();

        const point = [

            touch.clientX - rect.left,

            touch.clientY - rect.top

        ];

        const lngLat = map.unproject(point);

        if(marker){

            marker.remove();

        }

        marker = new mapboxgl.Marker()

            .setLngLat(lngLat)

            .addTo(map);

    },600);

});

canvas.addEventListener("touchend",()=>{

    clearTimeout(pressTimer);

});

// ==========================================
// 右クリックでマーカー削除
// ==========================================

map.on("contextmenu",()=>{

    if(marker){

        marker.remove();

        marker = null;

    }

});

// ==========================================
// コンソール表示
// ==========================================

console.log("Mapbox 日本語版 初期化完了");
