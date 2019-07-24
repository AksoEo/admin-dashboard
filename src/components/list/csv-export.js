import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import LinearProgress from '@material-ui/core/LinearProgress';
import Button from '@material-ui/core/Button';
import stringify from 'csv-stringify';
import * as actions from './actions';
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

    endExport () {
        this.abortExport();
        this.setState({ exporting: true });

        const stringifier = stringify();
        const rows = [];
        stringifier.on('readable', () => {
            let row;
            while ((row = stringifier.read())) rows.push(row);
        });
        stringifier.on('error', err => {
            this.setState({ exporting: false, error: err });
        });
        stringifier.on('finish', () => {
            const blob = new Blob(rows, { type: 'text/csv' });
            const objectURL = URL.createObjectURL(blob);
            const filename = `${this.props.filename}-${new Date().toISOString()}.csv`;
            this.setState({ objectURL, filename, exporting: false });
        });

        if (this.state.data.length) {
            // header
            stringifier.write(
                Object.fromEntries(Object.keys(this.state.data[0]).map(x => ([x, x]))),
            );
        }
        for (const item of this.state.data) stringifier.write(item);
        stringifier.end();
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
                <DialogContent>
                    {!this.state.exporting ? (
                        this.state.error ? (
                            <Button onClick={this.resumeExport}>
                                {locale.listView.csvExport.tryResumeExport}
                            </Button>
                        ) : this.state.objectURL ? (
                            <Button
                                component="a"
                                href={this.state.objectURL}
                                download={this.state.filename}>
                                {locale.listView.csvExport.download}
                            </Button>
                        ) : (
                            <Button onClick={this.resumeExport}>
                                {locale.listView.csvExport.beginExport}
                            </Button>
                        )
                    ) : (
                        <React.Fragment>
                            <LinearProgress
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
