// 地図表示　----------------------------------------------------------------------------------------------------
const map = L.map('map').setView([36.0, 138.0], 5);

L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
    attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
    maxZoom: 18,
}).addTo(map);

// 位置取得　----------------------------------------------------------------------------------------------------
let marker = null;

const updateLocation = (position) => {
    const lat = parseFloat(position.coords.latitude.toFixed(5));
    const lon = parseFloat(position.coords.longitude.toFixed(5));
    const alt = position.coords.altitude || 0.0;
    const fixed_alt = parseFloat(alt.toFixed(2));

    if (gpsPublisher) {
        const msg = new ROSLIB.Message({
            header: {
                stamp: { secs: Math.floor(Date.now() / 1000), nsecs: 0 },
                frame_id: 'gps'
            },
            status: { status: 0, service: 1 },
            latitude: lat,
            longitude: lon,
            altitude: fixed_alt,
            position_covariance: [0, 0, 0, 0, 0, 0, 0, 0, 0],
            position_covariance_type: 0
        });

        gpsPublisher.publish(msg);
    }

    document.getElementById("lat-cell").textContent = lat;
    document.getElementById("lon-cell").textContent = lon;
    document.getElementById("alt-cell").textContent = alt ? fixed_alt : "---";

    console.log("DATA", "lat: ", lat, "lon: ", lon, "alt: ", alt);

    if (marker) {
        marker.setLatLng([lat, lon]);
    } else {
        marker = L.marker([lat, lon]).addTo(map);
    }
    map.setView([lat, lon], 18);
};

const handleError = (error) => {
    console.error('【Error】', error);
};

// ROS通信　----------------------------------------------------------------------------------------------------
let ros = null;
let gpsPublisher = null;

const connectROS = (protocol, ip, port, ros_domain_id) => {

    if (ros) return;

    ros = new ROSLIB.Ros({
        url: `${protocol}://${ip}:${port}`,
        options: {
            ros_domain_id: ros_domain_id
        }
    });

    ros.on("connection", () => {
        console.log("【INFO】Connected to ROS");

        gpsPublisher = new ROSLIB.Topic({
            ros: ros,
            name: "/gps/fix",
            messageType: "sensor_msgs/NavSatFix"
        });
    });

    ros.on("error", (error) => {
        console.log("【ERROR】", error);
        ros = null;
    });

    ros.on("close", () => {
        console.log("【INFO】ROS connection closed");
        ros = null;
    });
};

// 定期実行　----------------------------------------------------------------------------------------------------
if (navigator.geolocation) {
    setInterval(() => {
        navigator.geolocation.getCurrentPosition(updateLocation, )
    }, 100);
}

// ページ読み込み時
window.addEventListener("DOMContentLoaded", () => {
    const protocol = document.getElementById("protocol").value;
    const ip = document.getElementById("ip").value;
    const port = document.getElementById("port").value;
    const ros_domain_id = document.getElementById("ros_domain_id").value;
    connectROS(protocol, ip, port, ros_domain_id);
});

// 「接続」押下時
document.getElementById("connect").addEventListener("click", () => {
    const protocol = document.getElementById("protocol").value;
    const ip = document.getElementById("ip").value;
    const port = document.getElementById("port").value;
    const ros_domain_id = document.getElementById("ros_domain_id").value;
    connectROS(protocol, ip, port, ros_domain_id);
});