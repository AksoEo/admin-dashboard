import { h } from 'preact';
import { TextField } from '@cpsdqs/yamdl';
import moment from 'moment';
import { time, timestamp } from '../../../../../components/data';
import MdField from '../../../../../components/md-field';
import LocationPicker from '../location-picker';
import './fields.less';

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

function TimeBoundEditor ({ value, editing, onChange, userData }) {
    const { tz } = userData;

    if (editing) return <timestamp.editor outline value={value} onChange={onChange} zone={tz} />;
    return <timestamp.renderer value={value * 1000} onChange={onChange} zone={tz} />;
}

export const FIELDS = {
    title: {
        sortable: true,
        slot: 'title',
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
        slot: 'body',
        skipLabel: true,
        component ({ value, editing, onChange, slot }) {
            return <MdField
                class="congress-program-description"
                data-slot={slot}
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
        component ({ value, editing, onChange, userData, slot }) {
            if (!userData) return null;
            return <LocationPicker
                disabled={slot !== 'detail'}
                congress={userData.congress}
                instance={userData.instance}
                value={value}
                editing={editing}
                onChange={onChange} />;
        },
    },
};

export const OVERVIEW_FIELDS = {
    ...FIELDS,
    timeLoc: {
        slot: 'body',
        skipLabel: true,
        component ({ item, ...extra }) {
            const Location = FIELDS.location.component;

            const { timeFrom, timeTo, location } = item;

            const day = moment(timeFrom * 1000).startOf('d');
            const secondsFrom = moment(timeFrom * 1000).diff(day, 's');
            const secondsTo = moment(timeTo * 1000).diff(day, 's');

            return (
                <div class="congress-program-time-loc">
                    <div class="ptl-time">
                        <time.renderer value={secondsFrom} />
                        {'–'}
                        <time.renderer value={secondsTo} />
                    </div>
                    <div class="ptl-location">
                        <Location {...extra} value={location} item={item} />
                    </div>
                </div>
            );
        },
    },
};
