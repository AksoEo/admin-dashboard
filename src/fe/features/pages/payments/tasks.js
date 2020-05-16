import { h } from 'preact';
import TaskDialog from '../../../components/task-dialog';
import {
    paymentOrgs as orgLocale,
    paymentAddons as addonLocale,
    paymentMethods as methodLocale,
} from '../../../locale';

export default {
    deleteOrg ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={orgLocale.delete.title}
                actionLabel={orgLocale.delete.button}
                run={() => task.runOnce()}>
                {orgLocale.delete.description}
            </TaskDialog>
        );
    },
    deleteAddon ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={addonLocale.delete.title}
                actionLabel={addonLocale.delete.button}
                run={() => task.runOnce()}>
                {addonLocale.delete.description}
            </TaskDialog>
        );
    },
    deleteMethod ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={methodLocale.delete.title}
                actionLabel={methodLocale.delete.button}
                run={() => task.runOnce()}>
                {methodLocale.delete.description}
            </TaskDialog>
        );
    },
};
