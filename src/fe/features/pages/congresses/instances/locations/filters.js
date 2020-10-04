import { h } from 'preact';
import Segmented from '../../../../../components/segmented';
import { congressLocations as locale } from '../../../../../locale';
import LocationPicker from '../location-picker';

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
        editor ({ value, onChange, onEnabledChange, hidden, userData }) {
            // TODO: improve this thing/DRY with programs
            // would ideally be like the tag editor (checkboxes in a list) instead of like this
            const { congress, instance } = userData;
            const items = [];

            const removeIndex = index => {
                const v = value.slice();
                v.splice(index, 1);
                onChange(v);
                if (!v.length) onEnabledChange(false);
            };

            for (let i = 0; i < value.length; i++) {
                const index = i;
                const item = value[index];
                const onItemChange = item => {
                    if (item === null) removeIndex(index);
                };
                items.push(<LocationPicker
                    key={item}
                    externalOnly
                    disabled={hidden}
                    congress={congress}
                    instance={instance}
                    editing
                    adding
                    value={item}
                    onChange={onItemChange} />);
            }

            const onAddChange = item => {
                item = item.toString(); // only string ids
                const v = value.slice();
                if (v.includes(item)) return;
                v.push(item);
                onChange(v);
                onEnabledChange(true);
            };
            items.push(<LocationPicker
                externalOnly
                disabled={hidden}
                congress={congress}
                instance={instance}
                editing
                adding
                value={null}
                onChange={onAddChange} />);

            return (
                <div class="external-loc-editor">
                    {items}
                </div>
            );
        },
    },
};
