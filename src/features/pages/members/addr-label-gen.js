import { h } from 'preact';
import { useState } from 'preact/compat';
import { AppBarProxy, Button, MenuIcon, Checkbox } from 'yamdl';
import NativeSelect from '@material-ui/core/NativeSelect';
import {
    CardStackProvider, CardStackRenderer, CardStackItem,
} from '../../../components/card-stack';
import locale from '../../../locale';

export default function AddrLabelGenContainer ({ open, onClose }) {
    return (
        <CardStackProvider>
            <CardStackRenderer class="addr-label-gen-card-stack" />
            <CardStackItem
                open={open}
                onClose={onClose}
                depth={0}
                appBar={
                    <AppBarProxy
                        menu={<Button icon small onClick={onClose}>
                            <MenuIcon type="close" />
                        </Button>}
                        title={locale.members.addrLabelGen.title}
                        priority={9} />
                }>
                <AddrLabelGen />
            </CardStackItem>
        </CardStackProvider>
    );
}

function AddrLabelGen () {
    const [settings, setSettings] = useState({
        language: 'eo',
        latin: false,
        includeCode: true,
        paper: 'A4',
        margins: {
            top: 72,
            left: 72,
            right: 72,
            bottom: 72,
        },
        cols: 2,
        rows: 5,
        colGap: 72,
        rowGap: 72,
        cellPadding: 8,
        fontSize: 12,
        drawOutline: false,
    });

    return (
        <div class="addr-label-gen">
            <GenSettings value={settings} onChange={setSettings} />
        </div>
    );
}

/* eslint-disable react/display-name */

const ValCheckbox = ({ value, onChange }) => <Checkbox checked={value} onChange={onChange} />;

function GenSettings ({ value, onChange }) {
    const items = Object.entries({
        language: ({ value, onChange }) => (
            <NativeSelect value={value} onChange={e => onChange(e.target.value)}>
                {Object.entries(locale.members.csvOptions.countryLocales)
                    .map(([id, label]) => <option value={id} key={id}>{label}</option>)}
            </NativeSelect>
        ),
        latin: ValCheckbox,
        includeCode: ValCheckbox,
        paper: ({ value, onChange }) => (
            <NativeSelect value={value} onChange={e => onChange(e.target.value)}>
                {Object.entries(locale.members.addrLabelGen.paperSizes)
                    .map(([id, label]) => <option value={id} key={id}>{label}</option>)}
            </NativeSelect>
        ),
        margins: MarginsEditor,
        cols: () => 'unimplemented',
        rows: () => 'unimplemented',
        colGap: () => 'unimplemented',
        rowGap: () => 'unimplemented',
        cellPadding: () => 'unimplemented',
        fontSize: () => 'unimplemented',
        drawOutline: ValCheckbox,
    }).map(([id, Editor]) => (
        <div class="settings-item" key={id}>
            <label class="item-label">{locale.members.addrLabelGen.labels[id]}</label>
            <Editor value={value[id]} onChange={v => onChange({ ...value, [id]: v })} />
        </div>
    ));

    return <div class="gen-settings">{items}</div>;
}

function MarginsEditor ({ value, onChange }) {
    return 'unimplemented';
}
