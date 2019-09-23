import { h } from 'preact';
import { useState, Fragment } from 'preact/compat';
import { AppBarProxy, Button, MenuIcon, Checkbox, Dialog } from 'yamdl';
import NativeSelect from '@material-ui/core/NativeSelect';
import {
    CardStackProvider, CardStackRenderer, CardStackItem,
} from '../../../components/card-stack';
import locale from '../../../locale';
import client from '../../../client';

export default function AddrLabelGenContainer ({
    open, lvIsCursed, getRequestData, onClose,
}) {
    const [showSuccess, setShowSuccess] = useState(false);

    return (
        <Fragment>
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
                    <AddrLabelGen
                        lvIsCursed={lvIsCursed}
                        getRequestData={getRequestData}
                        onSuccess={() => {
                            onClose();
                            setShowSuccess(true);
                        }} />
                </CardStackItem>
            </CardStackProvider>
            <Dialog
                backdrop
                open={showSuccess}
                onClose={() => setShowSuccess(false)}
                actions={[
                    {
                        label: locale.members.addrLabelGen.closeDialog,
                        action: () => setShowSuccess(false),
                    },
                ]}>
                {locale.members.addrLabelGen.success}
            </Dialog>
        </Fragment>
    );
}

function AddrLabelGen ({ lvIsCursed, onSuccess, getRequestData }) {
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
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [resultOpen, setResultOpen] = useState(false);

    const sendRequest = () => {
        const { options } = getRequestData();
        setLoading(true);

        delete options.limit;
        delete options.offset;
        delete options.fields;

        client.post('/codeholders/!make_address_labels', settings, options)
            .then(onSuccess).catch(err => {
                setError(err);
                console.error(err); // eslint-disable-line no-console
                setResultOpen(true);
            }).then(() => setLoading(false));
    };

    return (
        <div class="addr-label-gen">
            {lvIsCursed ? <div class="cursed-notice">
                {locale.members.addrLabelGen.cursedNotice}
            </div> : null}
            <div class="addr-label-gen-inner">
                <GenPreview value={settings} />
                <GenSettings value={settings} onChange={setSettings} />
            </div>
            <footer class="addr-label-gen-footer">
                <Button raised class="generate-btn" onClick={sendRequest} disabled={isLoading}>
                    {locale.members.addrLabelGen.generate}
                </Button>
            </footer>
            <Dialog
                backdrop
                open={!!resultOpen}
                onClose={() => setResultOpen(false)}
                actions={[
                    {
                        label: locale.members.addrLabelGen.closeDialog,
                        action: () => setResultOpen(false),
                    },
                ]}>
                {(error || '').toString().includes('423')
                    ? locale.members.addrLabelGen.alreadySubmitted
                    : locale.members.addrLabelGen.genericError}
            </Dialog>
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

function GenPreview ({ value }) {
    return (
        <div class="gen-preview">
            todo: preview
        </div>
    );
}
