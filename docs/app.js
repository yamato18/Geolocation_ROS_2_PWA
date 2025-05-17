// 地図表示　----------------------------------------------------------------------------------------------------
const map = L.map('map').setView([36.0, 138.0], 5);

L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
    attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
    maxZoom: 18,
}).addTo(map);

// 位置取得　----------------------------------------------------------------------------------------------------
let marker = null;

const updateLocation = (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const alt = position.coords.altitude || 0.0;

    document.getElementById("lat-cell").textContent = lat.toFixed(5);
    document.getElementById("lon-cell").textContent = lon.toFixed(5);
    document.getElementById("alt-cell").textContent = alt ? alt.toFixed(2) : "---";

    if (marker) {
        marker.setLatLng([lat, lon]);
    } else {
        marker = L.marker([lat, lon]).addTo(map);
    }
    map.setView([lat, lon], 16);
}

const handleError = (error) => {
    console.error('【Error】', error);
}

// 定期実行　----------------------------------------------------------------------------------------------------
if (navigator.geolocation) {
    setInterval(() => {
        navigator.geolocation.getCurrentPosition(updateLocation, )
    }, 3000);
}