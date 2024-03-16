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
}

export default new MapManager();