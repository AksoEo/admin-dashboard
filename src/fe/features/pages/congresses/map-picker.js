import { h } from 'preact';
import { PureComponent } from 'preact/compat';
import Map from './map';
import LatLonEditor from './ll-editor';
import { data as locale } from '../../../locale';
import './map-picker.less';

/// Picks a location on a map.
///
/// - value/onChange: lat/lon tuple (number[2])
/// - nullable: if true, will allow clearing
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

    render ({ value, onChange, nullable }) {
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
                <div class={'map-picker-pick-banner' + (!value ? ' is-hidden' : '')}>
                    {locale.mapPicker.movePrompt}
                </div>
                <Map
                    class="a-map-picker-map"
                    center={this.initialCenter}
                    zoom={this.initialZoom}
                    markers={markers}
                    onClick={this.#onMapClick} />
                <LatLonEditor
                    value={value}
                    editing={true}
                    onChange={onChange}
                    onDelete={nullable && (() => onChange(null))} />
            </div>
        );
    }
}
