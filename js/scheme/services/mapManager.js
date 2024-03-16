class MapManager {
    map;

    async initMap() {
        const position = { lat: -25.344, lng: 131.031 };
        const { Map } = await google.maps.importLibrary("maps");
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
        this.map = new Map(document.getElementById("map"), {
            zoom: 4,
            center: position,
            mapId: "DEMO_MAP_ID"
        });
        const marker = new AdvancedMarkerElement({
            map: this.map,
            position: position,
            title: "Uluru",
        });
    }

    async takeMapAsScreenshot() {
        try {
            let element = document.querySelector("#capture");
            let preview = document.querySelector("#schemePreview");

            console.log('schemePreview', preview);

            if (html2canvas && element && preview) {
                preview.src = "";
                html2canvas(document.querySelector("#capture"), {
                    useCORS: true,
                    width: element.scrollWidth,
                    height: element.scrollHeight,
                    x: window.pageXOffset,
                    y: window.pageYOffset
                }).then(canvas => {
                    preview.src = canvas.toDataURL();
                });
            }
        } catch(e) {
            console.error('Error take screenshot: ', e);
        }
    }
}

export default new MapManager();