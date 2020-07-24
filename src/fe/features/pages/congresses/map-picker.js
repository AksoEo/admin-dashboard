import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import Map from './map';
import { data as locale } from '../../../locale';

export default class MapPicker extends PureComponent {
    constructor (props) {
        super(props);

        if (props.value) {
            this.initialCenter = props.value;
            this.initialZoom = 13;
        } else {
            this.initialCenter = [0, 0];
            this.initialZoom = 1;
        }
    }

    #onMapClick = e => {
        if (!this.props.onChange) return;
        this.props.onChange([e.latlng.lat, e.latlng.lng]);
    };

    render ({ value, onChange }) {
        const markers = [];

        if (value) {
            markers.push({
                location: value,
                onDragEnd: e => {
                    const loc = e.target.getLatLng();
                    onChange([loc.lat, loc.lng]);
                },
            });
        }

        return (
            <div class="a-map-picker">
                <div class={'map-picker-pick-banner' + (value ? ' is-hidden' : '')}>
                    {locale.mapPicker.pickPrompt}
                </div>
                <Map
                    center={this.initialCenter}
                    zoom={this.initialZoom}
                    markers={markers}
                    onClick={this.#onMapClick} />
            </div>
        );
    }
}
