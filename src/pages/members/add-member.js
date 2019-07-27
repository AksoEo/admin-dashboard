import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import locale from '../../locale';
import client from '../../client';

export default class AddMemberDialog extends React.PureComponent {
    static propTypes = {
        open: PropTypes.bool,
        onClose: PropTypes.func,
    };

    render () {
        return (
            <Dialog open={this.props.open} onClose={this.props.onClose}>
                <DialogTitle>
                    {locale.members.addMember.title}
                </DialogTitle>
                <DialogContent>
                    TODO: use login form for this
                </DialogContent>
            </Dialog>
        );
    }
}
