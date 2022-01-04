import { h } from 'preact';
import { useContext, useEffect, useRef, useState } from 'preact/compat';
import { Button, Checkbox, TextField } from 'yamdl';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import TinyProgress from '../../../../../components/controls/tiny-progress';
import DataList from '../../../../../components/lists/data-list';
import ItemPickerDialog from '../../../../../components/pickers/item-picker-dialog';
import { timestamp } from '../../../../../components/data';
import { connect, coreContext } from '../../../../../core/connection';
import { magazineSnaps as locale } from '../../../../../locale';
import CH_FIELDS from '../../../codeholders/table-fields';
import './fields.less';

export const FIELDS = {
    time: {
        component ({ value }) {
            return <timestamp.renderer value={value} />;
        },
    },
    name: {
        component ({ value, editing, onChange, slot }) {
            if (editing) {
                return (
                    <TextField
                        outline
                        label={slot === 'create' ? locale.fields.name : null}
                        value={value}
                        onChange={e => onChange(e.target.value || null)} />
                );
            }
            return value;
        },
    },
};

export function Footer ({ editing, userData }) {
    if (editing) return null;

    const core = useContext(coreContext);
    const [comparing, setComparing] = useState(false);
    const [compare, setCompare] = useState(null);
    const dataList = useRef(null);

    useEffect(() => {
        dataList.current?.clear();
    }, [compare]);

    const chkId = Math.random().toString(36);

    return (
        <div class="magazine-snapshot-footer">
            <div class="compare-control">
                <div class="compare-check-container">
                    <Checkbox
                        class="inner-checkbox"
                        id={chkId}
                        checked={comparing}
                        onChange={comparing => {
                            setComparing(comparing);
                            if (!comparing) setCompare(null);
                        }} />
                    <label for={chkId}>
                        {locale.codeholders.compare}
                    </label>
                </div>
                {comparing && (
                    <SnapshotPicker
                        magazine={userData.magazine}
                        edition={userData.edition}
                        value={compare}
                        onChange={setCompare} />
                )}
            </div>
            {compare ? (
                <div class="comparing-note">
                    {locale.codeholders.comparing}
                </div>
            ) : null}
            <DataList
                ref={dataList}
                emptyLabel={compare ? locale.codeholders.compareEmpty : locale.codeholders.empty}
                renderItem={item => <CodeholderItem codeholder={item} />}
                onLoad={(offset, limit) => core.createTask('magazines/snapshotCodeholders', {
                    magazine: userData.magazine,
                    edition: userData.edition,
                    id: userData.id,
                    compare,
                }, { offset, limit }).runOnceAndDrop()}
                useShowMore />
        </div>
    );
}

function SnapshotPicker ({ magazine, edition, value, onChange }) {
    const [open, setOpen] = useState(false);

    return (
        <div class="pick-snapshot">
            {value ? (
                <div class="item-preview">
                    <div class="item-remove">
                        <Button class="remove-button" icon small onClick={() => onChange(null)}>
                            <RemoveIcon />
                        </Button>
                    </div>
                    <SnapshotItem magazine={magazine} edition={edition} id={value} />
                </div>
            ) : (
                <Button class="add-button" icon small onClick={() => setOpen(true)}>
                    <AddIcon />
                </Button>
            )}

            <ItemPickerDialog
                open={open}
                onClose={() => setOpen(false)}
                limit={1}
                value={value ? [value] : []}
                onChange={value => onChange(value[0] || null)}
                task="magazines/listSnapshots"
                view="magazines/snapshot"
                options={{ magazine, edition }}
                viewOptions={{ magazine, edition }}
                fields={FIELDS}
                locale={locale.fields} />
        </div>
    );
}

const SnapshotItem = connect(({ magazine, edition, id }) => ['magazines/snapshot', {
    magazine,
    edition,
    id,
}])(data => ({ data }))(function SnapshotItem ({ data }) {
    if (!data) return <TinyProgress />;

    return (
        <div class="snapshot-item">
            <div class="snapshot-timestamp">
                <timestamp.renderer value={data.time} />
            </div>
            <div class="snapshot-name">
                {data.name}
            </div>
        </div>
    );
});

const SNAPSHOT_FIELDS = ['code', 'name', 'address'];
function CodeholderItem ({ codeholder }) {
    return (
        <div class="snapshot-codeholder">
            {SNAPSHOT_FIELDS.map(id => {
                const Field = CH_FIELDS[id].component;
                return (
                    <div class="codeholder-field" data-id={id} key={id}>
                        <Field
                            value={codeholder[id]}
                            item={codeholder}
                            fields={SNAPSHOT_FIELDS} />
                    </div>
                );
            })}
        </div>
    );
}
