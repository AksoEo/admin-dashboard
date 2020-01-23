import { h } from 'preact';
import { Dialog } from '@cpsdqs/yamdl';

export default {
    addCodeholder ({ open, task }) {
        return (
            <Dialog
                open={open}
                onClose={() => task.drop()}
                backdrop
                title="[[add codeholder]]"
                actions={[
                    {
                        label: '[[add]]',
                        action: () => {
                            // TODO
                        },
                    },
                ]}>
                codeholder picker goes here
            </Dialog>
        );
    },
    addClient ({ open, task }) {
        return (
            <Dialog
                open={open}
                onClose={() => task.drop()}
                backdrop
                title="[[add client]]"
                actions={[
                    {
                        label: '[[add]]',
                        action: () => {
                            // TODO
                        },
                    },
                ]}>
                client picker goes here
            </Dialog>
        );
    },
};
