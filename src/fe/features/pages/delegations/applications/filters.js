import { h } from 'preact';
import { timestamp } from '../../../../components/data';
import { delegationApplications as locale } from '../../../../locale';

export function makeStatusTimeFilterQuery (from, to) {
    return `filter(statusTime:(${from.toISOString()}$${to.toISOString()}))`;
}

export const FILTERS = {
    statusTime: {
        needsSwitch: true,
        default () {
            return { enabled: false, value: [new Date(new Date().getFullYear(), 0, 1), new Date()] };
        },
        serialize ({ value }) {
            return value.map(x => x.toISOString()).join('$');
        },
        deserialize (value) {
            return { enabled: true, value: value.split('$').map(x => new Date(x)) };
        },
        editor ({ value, onChange, onEnabledChange, hidden }) {
            return (
                <div class="status-time-filter">
                    <div>
                        <timestamp.editor
                            outline
                            label={locale.search.filters.timeRangeStart} disabled={hidden} value={+value[0] / 1000}
                            onChange={v => {
                                onChange([new Date(v * 1000), value[1]]);
                                onEnabledChange(true);
                            }} />
                    </div>
                    <div>
                        <timestamp.editor
                            outline
                            label={locale.search.filters.timeRangeEnd} disabled={hidden} value={+value[1] / 1000}
                            onChange={v => {
                                onChange([value[0], new Date(v * 1000)]);
                                onEnabledChange(true);
                            }} />
                    </div>
                </div>
            );
        },
    },
};
