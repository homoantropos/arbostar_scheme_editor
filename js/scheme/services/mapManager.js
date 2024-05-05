import schemeManager from "./schemeManager.js";
import { getDOMElement } from "../utils/viewManager.js";
import {mockEstimate} from "../../mockddata/mockEstimate.js";

class MapManager {
    map;
    maxZoom = 18;
    maxZoomService;
    async initMap() {
        const { MaxZoomService } = await google.maps.importLibrary("maps");
        this.maxZoomService = new MaxZoomService();
        const lat = mockEstimate.lead.latitude;
        const lng = mockEstimate.lead.longitude;
        const position = { lat: lat, lng: lng };
        const latLng = new google.maps.LatLng(lat, lng);
        await this.maxZoomService.getMaxZoomAtLatLng(latLng, (result) => {
            result.status === 'OK' && (this.maxZoom = result.zoom);
        });
        const { Map } = await google.maps.importLibrary("maps");
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
        this.map = new Map(getDOMElement("#map"), {
            center: position,
            disableDefaultUI: true,
            fullscreenControl: true,
            mapId: "DEMO_MAP_ID",
            mapTypeId: 'satellite',
            tilt: 0,
            zoom: this.maxZoom
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
            let element = getDOMElement("#capture");
            if (html2canvas && element) {
                html2canvas(element, {
                    useCORS: true,
                    width: element.scrollWidth,
                    height: element.scrollHeight,
                    x: window.pageXOffset,
                    y: window.pageYOffset,
                    willReadFrequently: true
                }).then(async canvas => {
                    schemeManager.initSchemeWithMapScreenShot(canvas.toDataURL());
                    await schemeManager.saveScheme();
                });
            }
        } catch(e) {
            console.error('Error take screenshot: ', e);
        }
    }
}

export default new MapManager();