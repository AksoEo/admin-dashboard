import { h } from 'preact';
import Segmented from '../../../../../components/segmented';
import { congressLocations as locale } from '../../../../../locale';

export const FILTERS = {
    type: {
        default: () => ({ enabled: false, value: null }),
        serialize: ({ value }) => value,
        deserialize: value => ({ enabled: true, value }),
        editor ({ value, onChange, enabled, onEnabledChange, hidden }) {
            const selected = enabled ? value : 'none';

            return (
                <Segmented class="smaller" selected={selected} onSelect={value => {
                    onEnabledChange(value !== 'none');
                    if (value !== 'none') onChange(value);
                }} disabled={hidden}>
                    {[
                        {
                            id: 'external',
                            label: locale.fields.types.external,
                        },
                        {
                            id: 'internal',
                            label: locale.fields.types.internal,
                        },
                        {
                            id: 'none',
                            label: locale.fields.types.none,
                            class: 'bordered',
                        },
                    ]}
                </Segmented>
            );
        },
    },
    externalLoc: {
        default: () => ({ enabled: false, value: [] }),
        serialize: ({ value }) => value.join(','),
        deserialize: value => ({ enabled: true, value: value.split(',') }),
        editor ({ value, onChange, hidden }) {
            // TODO: this
            return 'todo';
        },
    },
};
