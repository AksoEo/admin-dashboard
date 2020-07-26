import { h } from 'preact';
import { TextField } from '@cpsdqs/yamdl';
import { timestamp } from '../../../../../components/data';
import MdField from '../../../../../components/md-field';
import LocationPicker from '../location-picker';

function TextLen100 ({ value, editing, onChange }) {
    if (editing) {
        return <TextField
            outline
            value={value}
            onChange={e => onChange(e.target.value)}
            maxLength="100" />;
    }
    return value;
}

function TimeBoundEditor ({ value, editing, onChange }) {
    if (editing) return <timestamp.editor outline value={value} onChange={onChange} />;
    return <timestamp.renderer value={value * 1000} onChange={onChange} />;
}

export const FIELDS = {
    title: {
        sortable: true,
        component ({ value, editing, onChange }) {
            return <MdField
                value={value}
                onChange={onChange}
                editing={editing}
                singleLine
                rules={['emphasis', 'strikethrough']} />;
        },
    },
    description: {
        component ({ value, editing, onChange }) {
            return <MdField
                value={value}
                onChange={onChange}
                editing={editing}
                rules={['emphasis', 'strikethrough', 'link', 'list', 'table', 'image']} />;
        },
    },
    owner: {
        component: TextLen100,
    },
    timeFrom: {
        sortable: true,
        component: TimeBoundEditor,
    },
    timeTo: {
        sortable: true,
        component: TimeBoundEditor,
    },
    location: {
        sortable: true,
        component ({ value, editing, onChange, userData }) {
            if (!userData) return null;
            return <LocationPicker
                congress={userData.congress}
                instance={userData.instance}
                value={value}
                editing={editing}
                onChange={onChange} />;
        },
    },
};
