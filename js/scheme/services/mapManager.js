import schemeManager from "./schemeManager.js";

class MapManager {
    map;
    async initMap() {
        const position = { lat: 43.722095, lng: -79.394153 };
        const { Map } = await google.maps.importLibrary("maps");
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
        this.map = new Map(document.getElementById("map"), {
            center: position,
            disableDefaultUI: true,
            fullscreenControl: true,
            mapId: "DEMO_MAP_ID",
            mapTypeId: 'satellite',
            tilt: 0,
            zoom: 20
        });
        // add marker
        new AdvancedMarkerElement({
            map: this.map,
            position: position,
            title: "Uluru",
        });
    }

    async takeMapAsScreenshot() {
        try {
            let element = document.querySelector("#capture");
            let preview = document.querySelector("#schemePreview");

            if (html2canvas && element && preview) {
                preview.src = "";
                html2canvas(document.querySelector("#capture"), {
                    useCORS: true,
                    width: element.scrollWidth,
                    height: element.scrollHeight,
                    x: window.pageXOffset,
                    y: window.pageYOffset
                }).then(async canvas => {
                    preview.src = canvas.toDataURL();
                    schemeManager.initSchemeWithMapScreenShot(canvas.toDataURL());
                });
            }
        } catch(e) {
            console.error('Error take screenshot: ', e);
        }
    }
}

export default new MapManager();