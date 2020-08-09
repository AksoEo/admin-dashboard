import { h } from 'preact';
import { congressPrograms as locale } from '../../../../../locale';
import { timestamp } from '../../../../../components/data';

export const FILTERS = {
    timeSlice: {
        default: () => ({ enabled: false, value: [null, null] }),
        serialize: ({ value }) => value.map(x => x === null ? '' : x).join('$'),
        deserialize: value => ({ enabled: true, value: value.split('$').map(x => x ? +x : null) }),
        editor ({ value, onChange, onEnabledChange, hidden, userData }) {
            return (
                <div class="congress-programs-time-slice-filter">
                    <timestamp.editor
                        label={locale.search.filters.timeSliceFrom}
                        zone={userData.tz}
                        disabled={hidden}
                        outline
                        value={value[0]}
                        onChange={v => {
                            onEnabledChange(v || value[1]);
                            onChange([v, value[1]]);
                        }} />
                    <timestamp.editor
                        label={locale.search.filters.timeSliceTo}
                        zone={userData.tz}
                        disabled={hidden}
                        outline
                        value={value[1]}
                        onChange={v => {
                            onEnabledChange(v || value[0]);
                            onChange([value[0], v]);
                        }} />
                </div>
            );
        },
    },
    location: {
        default: () => ({ enabled: false, value: [] }),
        serialize: ({ value }) => value.join(','),
        deserialize: value => ({ enabled: true, value: value.split(',') }),
        editor ({ value, onChange, hidden }) {
            // TODO: this
            return 'todo';
        },
    },
};
