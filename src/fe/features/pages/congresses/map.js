import { h } from 'preact';
import L from 'leaflet';
import { Map, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './map.less';

// TODO: use proper DOM elements for these
const hlIcon = L.icon({
    iconUrl: '/assets/maps/pin.svg',
    iconSize: [128, 128],
    iconAnchor: [64, 120],
    shadowUrl: '/assets/maps/pin-shadow.svg',
    shadowSize: [180, 128],
    shadowAnchor: [64, 120],
});

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
/// - markers: { key: string?, location: coords, icon: Node }[]
export default function AMap ({
    markers,
    ...extra
}) {
    extra.class = (extra.class || '') + ' a-map-container';
    return (
        <Map {...extra}>
            <TileLayer
                url="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png?lang=eo"
                attribution="&copy <a href=&quot;https://osm.org/copyright&quot;>OpenStreetMap</a> contributors" />
            {(markers || []).map((m, i) => <MarkerRenderer
                {...m}
                key={m.key || i} />)}
        </Map>
    );
}

function MarkerRenderer ({ location, icon, highlighted, onDragEnd }) {
    // TODO: render icon
    void icon;
    return (
        <Marker
            position={location}
            icon={highlighted ? hlIcon : lIcon}
            draggable={!!onDragEnd}
            onDragEnd={onDragEnd} />
    );
}