import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import LinearProgress from '@material-ui/core/LinearProgress';
import Button from '@material-ui/core/Button';
import stringify from 'csv-stringify';
import * as actions from './actions';
import Segmented from '../segmented';
import locale from '../../locale';

const ITEMS_PER_PAGE = 100;

export default class CSVExport extends React.PureComponent {
    static propTypes = {
        open: PropTypes.bool,
        onClose: PropTypes.func,
        innerRef: PropTypes.func,
        state: PropTypes.object.isRequired,
        onSetPage: PropTypes.func.isRequired,
        onSetItemsPerPage: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
        filename: PropTypes.string.isRequired,
        localizedFields: PropTypes.object.isRequired,
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
            });

            if (this.state.page < Math.floor(action.stats.total / ITEMS_PER_PAGE)) {
                this.setState({ page: this.state.page + 1 }, () => {
                    this.props.onSetPage(this.state.page);
                    this.props.onSubmit();
                });
            } else this.endExport();
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
                const localized = this.props.localizedFields[id];
                if (!localized) throw new Error(`missing field name for ${id}`);
                return localized;
            }));

            // write data
            for (const item of this.state.data) {
                const data = [];

                for (const id of fields) {
                    const fieldSpec = this.props.fieldSpec[id];
                    if (!fieldSpec) throw new Error(`missing field spec for ${id}`);
                    if (!fieldSpec.stringify) throw new Error(`missing stringify for ${id}`);
                    const stringified = fieldSpec.stringify(item[id], item, fields);
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
            <Dialog open={this.props.open} onClose={this.onClose}>
                <DialogTitle>{locale.listView.csvExport.title}</DialogTitle>
                <DialogContent className="list-view-csv-export">
                    {!this.state.exporting ? (
                        this.state.error ? (
                            <React.Fragment>
                                <div className="export-error">
                                    {this.state.error.toString()}
                                </div>
                                <Button onClick={this.resumeExport}>
                                    {locale.listView.csvExport.tryResumeExport}
                                </Button>
                            </React.Fragment>
                        ) : this.state.objectURL ? (
                            <Button
                                component="a"
                                href={this.state.objectURL}
                                download={this.state.filename}>
                                {locale.listView.csvExport.download}
                            </Button>
                        ) : (
                            <React.Fragment>
                                <Segmented
                                    className="mode-switch"
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
                                <Button onClick={this.resumeExport}>
                                    {locale.listView.csvExport.beginExport}
                                </Button>
                            </React.Fragment>
                        )
                    ) : (
                        <React.Fragment>
                            <LinearProgress
                                className="progress-bar"
                                value={(this.state.data.length / this.state.totalItems * 100) | 0}
                                variant={'determinate'} />
                            {!this.state.error && <Button onClick={this.abortExport}>
                                {locale.listView.csvExport.abortExport}
                            </Button>}
                        </React.Fragment>
                    )}
                </DialogContent>
            </Dialog>
        );
    }
}
