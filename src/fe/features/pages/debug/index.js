import { h } from 'preact';
import JSON5 from 'json5';
import { useState, Fragment } from 'preact/compat';
import { Dialog } from '@cpsdqs/yamdl';
import Page from '../../../components/page';
import { app as locale } from '../../../locale';
import permsContext from '../../../perms';
import { connect, coreContext } from '../../../core/connection';
import Meta from '../../meta';

export default class DebugPage extends Page {
    render () {
        return (
            <div class="debug-page">
                <Meta title="AKSO Debug Page" />
                <p>{locale.debugPageInfo}</p>
                <LoginStateViewer />
                <PermsViewer />
                <CodeholderFieldsViewer />
                <CodeholderFiltersViewer />
                <RequestRunner />
            </div>
        );
    }
}

function ObjectViewer ({ value: obj, shallow }) {
    const [open, setOpen] = useState(false);
    const baseStyle = {
        font: '12px Menlo, monospace',
        background: '#000',
        color: 'white',
    };
    const disclosure = <button style={{ color: 'inherit', background: '#777', borderColor: 'transparent' }} onClick={() => setOpen(!open)}>{open ? 'v' : '>'}</button>;
    if (Array.isArray(obj)) {
        if (shallow) return '[…]';
        return open ? (
            <div style={baseStyle}>
                {disclosure}[
                {obj.map((x, i) => (<div style={{ paddingLeft: '2em' }} key={i}>{i}: <ObjectViewer value={x} /></div>))}
                ]
            </div>
        ) : (
            <span style={{ ...baseStyle, display: 'inline-block' }}>
                {disclosure}
                [
                {obj.slice(0, 5).flatMap((x, i) => [
                    <ObjectViewer key={i} value={x} shallow />,
                    ', ',
                ])}
                {obj.length > 5 ? '…' : ''}
                ] ({obj.length} item{obj.length === 1 ? '' : 's'})
            </span>
        );
    } else if (typeof obj === 'object' && obj !== null) {
        if (shallow) return '{…}';
        const keys = Object.keys(obj);
        return open ? (
            <div style={baseStyle}>
                {disclosure}
                {'{'}
                {keys.map(x => (
                    <div style={{ paddingLeft: '2em' }} key={x}>
                        <span style={{ color: '#f54784' }}>{x}</span>: <ObjectViewer value={obj[x]} />
                    </div>))}
                {'}'}
            </div>
        ) : (
            <span style={{ ...baseStyle, display: 'inline-block' }}>
                {disclosure}
                {'{'}
                {keys.slice(0, 5).flatMap(x => [
                    <span key={x}><span style={{ color: '#f54784' }}>{x}</span>: <ObjectViewer value={obj[x]} shallow /></span>,
                    ', ',
                ])}
                {keys.length > 5 ? '…' : ''}
                {'}'}
            </span>
        );
    } else {
        let color = 'white';
        let os = '' + obj;
        if (typeof obj === 'number') color = '#ed9b50';
        else if (typeof obj === 'string') {
            color = '#4ebc6b';
            os = JSON.stringify(obj);
        } else if (typeof obj === 'boolean') color = '#ed9b50';
        return <span style={{ ...baseStyle, color }}>{os}</span>;
    }
}

function makeDialog (title, Inner) {
    return function ThingViewer () {
        const [open, setOpen] = useState(false);
        return (
            <Fragment>
                <button onClick={() => setOpen(true)}>{title}</button>
                <Dialog
                    open={open}
                    onClose={() => setOpen(false)}
                    title={title}
                    style={{ width: '80%', height: '80%' }}>
                    <Inner />
                </Dialog>
            </Fragment>
        );
    };
}

function makeDataViewer (title, view) {
    return makeDialog(title, connect(view)(data => ({ data }))(({ data }) => (
        <ObjectViewer value={data} />
    )));
}

const PermsViewer = makeDialog('perms', () => (
    <permsContext.Consumer>
        {perms => <ObjectViewer value={perms.perms} />}
    </permsContext.Consumer>
));

const CodeholderFieldsViewer = makeDataViewer('codeholder fields', 'codeholders/fields');
const CodeholderFiltersViewer = makeDataViewer('codeholder filters', 'codeholders/filters');
const LoginStateViewer = makeDataViewer('login state', 'login');

function ReqRunnerInner ({ core }) {
    const [method, setMethod] = useState('get');
    const [endpoint, setEndpoint] = useState('');
    const [options, setOptions] = useState('');
    const [body, setBody] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const run = () => {
        core.createTask('debug/request', {
            method,
            endpoint,
            options: options.trim() ? JSON5.parse(options) : undefined,
            body: body.trim() ? JSON5.parse(body) : undefined,
        }).runOnceAndDrop().then(res => {
            setResult(res);
            setError(null);
        }).catch(err => {
            setResult(null);
            setError(err);
        });
    };

    return (
        <div>
            <select value={method} onChange={e => setMethod(e.target.value)}>
                <option value="get">GET</option>
                <option value="post">POST</option>
                <option value="put">PUT</option>
                <option value="patch">PATCH</option>
                <option value="delete">DELETE</option>
            </select>
            <input value={endpoint} onChange={e => setEndpoint(e.target.value)} />
            <br />
            options: <textarea value={options} onChange={e => setOptions(e.target.value)} />
            <br />
            body: <textarea value={body} onChange={e => setBody(e.target.value)} />
            <br />
            <button onClick={run}>run</button>
            <br />
            {result ? 'result' : error ? 'error' : ''}
            {result ? <ObjectViewer value={result} /> : null}
            {error ? <ObjectViewer value={error} /> : null}
        </div>
    );
}

const RequestRunner = makeDialog('run request', () => (
    <coreContext.Consumer>{core => <ReqRunnerInner core={core} />}</coreContext.Consumer>
));
