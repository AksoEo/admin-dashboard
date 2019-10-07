import { h } from 'preact';
import { Dialog } from '@cpsdqs/yamdl';

// TODO
export default {
    initCreatePassword: ({ open, task }) => (
        <Dialog
            backdrop
            open={open}
            onClose={() => task.drop()}>
            forgot/create password form goes here
        </Dialog>
    ),
};
