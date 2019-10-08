import { h } from 'preact';
import { Dialog, TextField, CircularProgress, Button } from '@cpsdqs/yamdl';
import { generic as locale } from './locale';

export function info ({ open, task }) {
    const { title, message } = task.options;
    const close = () => task.runOnceAndDrop();

    return (
        <Dialog
            backdrop
            open={open}
            onClose={close}
            title={title}
            actions={[
                {
                    label: locale.close,
                    action: close,
                }
            ]}>
            {message}
        </Dialog>
    );
}