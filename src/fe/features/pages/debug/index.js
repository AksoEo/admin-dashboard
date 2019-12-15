import { h } from 'preact';
import JSON5 from 'json5';
import { useState, Fragment } from 'preact/compat';
import { Dialog } from '@cpsdqs/yamdl';
import Page from '../../../components/page';
import ObjectViewer from '../../../components/object-viewer';
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
