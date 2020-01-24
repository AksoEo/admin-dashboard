import { h } from 'preact';
import { Dialog } from '@cpsdqs/yamdl';
import { adminGroups as locale } from '../../../../locale';

export default {
    create ({ open, task }) {
        return (
            <Dialog
                open={open}
                onClose={() => task.drop()}
                backdrop
                title={locale.add}
                actions={[
                    {
                        label: '[[create]]',
                        action: () => {
                            // TODO
                        },
                    },
                ]}>
                group creation goes here
            </Dialog>
        );
    },
    delete ({ open, task }) {
        return (
            <Dialog
                open={open}
                onClose={() => task.drop()}
                backdrop
                title="[[delete group]]"
                actions={[
                    {
                        label: '[[delete]]',
                        action: () => {
                            // TODO
                        },
                    },
                ]}>
                are you sure you want to delete etc
            </Dialog>
        );
    },
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
