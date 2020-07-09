import { h } from 'preact';
import L from 'leaflet';
import { Map, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './map.less';

const lIcon = L.icon({
    iconUrl: '/assets/maps/pin.svg',
    iconSize: [64, 64],
    iconAnchor: [32, 60],
    shadowUrl: '/assets/maps/pin-shadow.svg',
    shadowSize: [90, 64],
    shadowAnchor: [32, 60],
});

/// Renders a map.
///
/// # Props
/// - center: center location
/// - zoom: zoom level
/// - markers: { key: string?, location: coords, icon: Node }[]
export default function AMap ({
    center,
    zoom,
    markers,
}) {
    return (
        <Map class="a-map-container" center={center} zoom={zoom}>
            <TileLayer
                url="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png?lang=eo"
                attribution="&copy <a href=&quot;https://osm.org/copyright&quot;>OpenStreetMap</a> contributors" />
            {markers.map((m, i) => <MarkerRenderer
                key={m.key || i}
                location={m.location}
                icon={m.icon} />)}
        </Map>
    );
}

function MarkerRenderer ({ location, icon }) {
    // TODO: render icon
    void icon;
    return (
        <Marker
            position={location}
            icon={lIcon} />
    );
}
