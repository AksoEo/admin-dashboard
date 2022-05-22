import {
    newsletters as locale,
} from '../../../locale';
import { createDialog, updateDialog, deleteDialog } from '../../../components/tasks/task-templates';
import { FIELDS } from './fields';

export default {
    create: createDialog({
        locale,
        fieldNames: ['org', 'name', 'description'],
        fields: FIELDS,
        className: 'newsletters-task-create',
        onCompletion: (task, routerContext, id) => routerContext.navigate(`/bultenoj/${id}`),
    }),
    update: updateDialog({ locale: locale.update, fields: locale.fields }),
    delete: deleteDialog({ locale: locale.delete }),
};
