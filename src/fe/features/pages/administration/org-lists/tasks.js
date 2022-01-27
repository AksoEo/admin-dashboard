import { createDialog, updateDialog, deleteDialog } from '../../../../components/tasks/task-templates';
import { FIELDS } from './fields';
import { orgLists as locale } from '../../../../locale';
import './tasks.less';

export default {
    createList: createDialog({
        className: 'org-lists-task-create-list',
        locale,
        fieldNames: ['name'],
        fields: FIELDS,
        onCompletion: (task, routerContext, id) => routerContext.navigate(`/administrado/fakaj-asocioj/${id}`),
    }),
    updateList: updateDialog({ locale: locale.update, fields: locale.fields }),
    deleteList: deleteDialog({ locale: locale.delete }),
};
