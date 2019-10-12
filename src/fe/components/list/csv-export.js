import { h } from 'preact';
import { PureComponent, Fragment } from 'preact/compat';
import PropTypes from 'prop-types';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Dialog, Button } from '@cpsdqs/yamdl';
import NativeSelect from '@material-ui/core/NativeSelect';
import stringify from 'csv-stringify';
import * as actions from './actions';
import Segmented from '../segmented';
import locale from '../../locale';

const ITEMS_PER_PAGE = 100;

/// The CSV export dialog.
export default class CSVExport extends PureComponent {
    static propTypes = {
        open: PropTypes.bool,
        onClose: PropTypes.func,
        /// For getting a ref to this component (because redux wrapper components, apparently)
        innerRef: PropTypes.func,
        /// The entire redux state.
        state: PropTypes.object.isRequired,
        onSetPage: PropTypes.func.isRequired,
        onSetItemsPerPage: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
        /// File name prefix.
        filename: PropTypes.string.isRequired,
        localizedFields: PropTypes.object.isRequired,
        localizedCSVFields: PropTypes.object.isRequired,
        userOptions: PropTypes.object,
        fieldSpec: PropTypes.object.isRequired,
    };

    originalPage = 0;
    originalItemsPerPage = 10;

    state = {
        data: [],
        page: 0,
        totalItems: 0,
        exporting: false,
        error: null,
        objectURL: null,
        mode: 'csv',
        options: {},
    };

    beginExport () {
        this.originalPage = this.props.state.list.page;
        this.originalItemsPerPage = this.props.state.list.itemsPerPage;

        this.setState({
            data: [],
            page: 0,
            totalItems: 0,
            exporting: true,
            error: null,
            objectURL: null,
        }, () => {
            this.props.onSetPage(0);
            this.props.onSetItemsPerPage(ITEMS_PER_PAGE);
            this.props.onSubmit();
        });
    }

    resumeExport = () => {
        if (this.state.error) this.props.onSubmit();
        else this.beginExport();
    };

    receiveAction (action) {
        if (!this.state.exporting) return;
        if (action.type === actions.RECEIVE_SUCCESS) {
            this.setState({
                data: this.state.data.concat(action.items),
                totalItems: action.stats.total,
                error: null,
            }, () => {
                if (this.state.page < Math.floor(action.stats.total / ITEMS_PER_PAGE)) {
                    this.setState({ page: this.state.page + 1 }, () => {
                        this.props.onSetPage(this.state.page);
                        this.props.onSubmit();
                    });
                } else this.endExport();
            });
        } else if (action.type === actions.RECEIVE_FAILURE) {
            this.setState({
                error: action.error,
            });
        }
    }

    abortExport = () => {
        this.setState({ exporting: false, error: null }, () => {
            this.props.onSetPage(this.originalPage);
            this.props.onSetItemsPerPage(this.originalItemsPerPage);
            this.props.onSubmit();
        });
    };

    async endExport () {
        try {
            this.abortExport();
            this.setState({ exporting: true });

            const stringifier = stringify({
                delimiter: this.state.mode === 'csv' ? ',' : '\t',
            });
            const rows = [];
            stringifier.on('readable', () => {
                let row;
                while ((row = stringifier.read())) rows.push(row);
            });
            stringifier.on('error', err => {
                this.setState({ exporting: false, error: err });
            });
            stringifier.on('finish', () => {
                const ext = this.state.mode;
                const mime = this.state.mode === 'csv' ? 'text/csv' : 'text/tab-separated-values';
                const blob = new Blob(rows, { type: mime });
                const objectURL = URL.createObjectURL(blob);
                const filename = `${this.props.filename}-${new Date().toISOString()}.${ext}`;
                this.setState({ objectURL, filename, exporting: false });
            });

            // compile selected fields
            const fields = [];
            for (const field of this.props.state.results.transientFields) {
                if (!fields.includes(field)) fields.push(field);
            }
            for (const field of this.props.state.fields.fixed) {
                if (!fields.includes(field.id)) fields.push(field.id);
            }
            for (const field of this.props.state.fields.user) {
                if (!fields.includes(field.id)) fields.push(field.id);
            }

            // write header
            stringifier.write(fields.map(id => {
                const localized = this.props.localizedCSVFields[id]
                    || this.props.localizedFields[id];
                if (!localized) throw new Error(`missing field name for ${id}`);
                return localized;
            }));

            const options = this.state.options;

            // write data
            for (const item of this.state.data) {
                const data = [];

                for (const id of fields) {
                    const fieldSpec = this.props.fieldSpec[id];
                    if (!fieldSpec) throw new Error(`missing field spec for ${id}`);
                    if (!fieldSpec.stringify) throw new Error(`missing stringify for ${id}`);
                    const stringified = fieldSpec.stringify(item[id], item, fields, options);
                    if (stringified instanceof Promise) data.push(await stringified);
                    else data.push(stringified);
                }

                stringifier.write(data);
            }
            stringifier.end();
        } catch (err) {
            console.error(err); // eslint-disable-line no-console
            this.setState({ error: err, exporting: false });
        }
    }

    onClose = () => {
        if (this.state.exporting) this.abortExport();
        if (this.state.objectURL) this.setState({ objectURL: null });
        if (this.props.onClose) this.props.onClose();
    };

    render () {
        if (this.props.innerRef) this.props.innerRef(this);

        return (
            <Dialog
                open={this.props.open}
                backdrop
                class="list-view-csv-export"
                onClose={this.onClose}
                title={locale.listView.csvExport.title}>
                {!this.state.exporting ? (
                    this.state.error ? (
                        <Fragment>
                            <div className="export-error">
                                {this.state.error.toString()}
                            </div>
                            <Button
                                key="resume"
                                class="action-button"
                                onClick={this.resumeExport}>
                                {locale.listView.csvExport.tryResumeExport}
                            </Button>
                        </Fragment>
                    ) : this.state.objectURL ? (
                        <Button
                            key="download"
                            class="action-button"
                            href={this.state.objectURL}
                            download={this.state.filename}>
                            {locale.listView.csvExport.download}
                        </Button>
                    ) : (
                        <Fragment>
                            <Segmented
                                class="mode-switch"
                                selected={this.state.mode}
                                onSelect={mode => this.setState({ mode })}>
                                {[
                                    {
                                        id: 'csv',
                                        label: locale.listView.csvExport.commaSeparated,
                                    },
                                    {
                                        id: 'tsv',
                                        label: locale.listView.csvExport.tabSeparated,
                                    },
                                ]}
                            </Segmented>
                            <UserOptions
                                options={this.props.userOptions || {}}
                                value={this.state.options}
                                onChange={options => this.setState({ options })} />
                            <Button
                                key="begin"
                                class="action-button"
                                onClick={this.resumeExport}>
                                {locale.listView.csvExport.beginExport}
                            </Button>
                        </Fragment>
                    )
                ) : (
                    <Fragment>
                        <LinearProgress
                            className="progress-bar"
                            value={(this.state.data.length / this.state.totalItems * 100) | 0}
                            variant={'determinate'} />
                        {!this.state.error && <Button
                            key="abort"
                            class="action-button"
                            onClick={this.abortExport}>
                            {locale.listView.csvExport.abortExport}
                        </Button>}
                    </Fragment>
                )}
            </Dialog>
        );
    }
}

/// Renders user-defined options. See list view docs for details.
class UserOptions extends PureComponent {
    static propTypes = {
        options: PropTypes.object.isRequired,
        value: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    componentDidMount () {
        this.updateValue();
    }

    componentDidUpdate (prevProps) {
        if (prevProps.options !== this.props.options) this.updateValue();
    }

    updateValue () {
        const value = { ...this.props.value };
        let didChange = false;

        for (const key in this.props.options) {
            if (!(key in value)) {
                value[key] = this.props.options[key].default;
                didChange = true;
            }
        }

        if (didChange) this.props.onChange(value);
    }

    render () {
        const options = [];

        for (const key in this.props.options) {
            if (!(key in this.props.value)) continue;

            const spec = this.props.options[key];
            let control;

            if (spec.type === 'select') {
                control = (
                    <NativeSelect
                        value={this.props.value[key]}
                        onChange={e => {
                            this.props.onChange({
                                ...this.props.value,
                                [key]: e.target.value,
                            });
                        }}>
                        {spec.options.map(([id, label]) => (
                            <option key={id} value={id}>{label}</option>
                        ))}
                    </NativeSelect>
                );
            } else {
                throw new Error('unknown option type');
            }

            options.push(
                <tr className="option" key={key}>
                    <td className="option-label">{spec.name}</td>
                    <td className="option-control">{control}</td>
                </tr>
            );
        }

        return (
            <table className="user-options">
                <tbody>
                    {options}
                </tbody>
            </table>
        );
    }
}
