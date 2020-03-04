import { h } from 'preact';
import { Dialog } from '@cpsdqs/yamdl';
import { generic as locale } from './locale';

/// Shows a single info dialog.
export function info ({ open, task }) {
    if (!task.options) return null;
    const { title, message } = task.options;

    return (
        <Dialog
            backdrop
            open={open}
            onClose={() => task.drop()}
            title={title}
            actions={[
                {
                    label: locale.close,
                    action: () => task.run(),
                },
            ]}>
            {message}
        </Dialog>
    );
}
