import { h, Component } from 'preact';
import { Dialog, TextField, AppBarProxy, Button, MenuIcon } from '@cpsdqs/yamdl';
import DoneIcon from '@material-ui/icons/Done';
import { adminGroups as locale } from '../../../../locale';
import { Validator } from '../../../../components/form';
import TaskDialog from '../../../../components/task-dialog';
import { routerContext } from '../../../../router';
import { ContextualAction } from '../../../../context-action';

export default {
    create ({ open, task }) {
        return (
            <routerContext.Consumer>
                {routerContext => (
                    <TaskDialog
                        open={open}
                        onClose={() => task.drop()}
                        title={locale.add}
                        actionLabel={locale.addButton}
                        run={() => task.runOnce().then(id => {
                            routerContext.navigate(`/administrado/grupoj/${id}`);
                        })}>
                        <Validator
                            component={TextField}
                            label={locale.fields.name}
                            value={task.parameters.name || ''}
                            onChange={e => task.update({ name: e.target.value })}
                            validate={name => {
                                if (!name) throw { error: locale.nameRequired };
                            }} />
                        <Validator
                            component={TextField}
                            label={locale.fields.description}
                            value={task.parameters.description || ''}
                            onChange={e => task.update({ description: e.target.value })}
                            validate={() => {}} />
                    </TaskDialog>
                )}
            </routerContext.Consumer>
        );
    },
    update ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={locale.editGroup}
                actionLabel={locale.editUpdate}
                run={() => task.runOnce()}>
                <Validator
                    component={TextField}
                    label={locale.fields.name}
                    value={task.parameters.name || ''}
                    onChange={e => task.update({ name: e.target.value })}
                    validate={name => {
                        if (!name) throw { error: locale.nameRequired };
                    }} />
                <Validator
                    component={TextField}
                    label={locale.fields.description}
                    value={task.parameters.description || ''}
                    onChange={e => task.update({ description: e.target.value })}
                    validate={() => {}} />
            </TaskDialog>
        );
    },
    delete ({ open, task }) {
        return (
            <routerContext.Consumer>
                {routerContext => (
                    <TaskDialog
                        open={open}
                        onClose={() => task.drop()}
                        title={locale.delete}
                        actionLabel={locale.deleteButton}
                        run={() => task.runOnce().then(() => {
                            routerContext.navigate('/administrado/grupoj');
                        })}>
                        {locale.deleteAreYouSure}
                    </TaskDialog>
                )}
            </routerContext.Consumer>
        );
    },
    addCodeholdersBatchTask: class AddCodeholderTask extends Component {
        static contextType = routerContext;

        selected = new Set();

        constructor (props) {
            super(props);

            this.contextTask = {
                lockSidebar: true,
                action: 'select-codeholders',
                selected: {
                    add: this.#add,
                    delete: this.#delete,
                    has: this.#has,
                },
            };
        }

        #add = (item) => {
            this.selected.add(item);
            this.contextTask = { ...this.contextTask };
            this.forceUpdate();
        };
        #has = (item) => this.selected.has(item);
        #delete = (item) => {
            this.selected.delete(item);
            this.contextTask = { ...this.contextTask };
            this.forceUpdate();
        };

        componentDidMount () {
            setTimeout(() => {
                if (this.props.task.dropped) return;
                this.context.navigate(`/membroj`);
            }, 50);
        }

        render ({ open, core, task }) {
            if (!open) return null;

            return (
                <div class="add-codeholder-task">
                    <ContextualAction
                        task={this.contextTask}
                        onClose={() => task.drop()} />
                    <AppBarProxy
                        class="context-action-app-bar"
                        priority={20}
                        menu={<Button small icon onClick={() => task.drop()}>
                            <MenuIcon type="close" />
                        </Button>}
                        title={locale.addCodeholders}
                        actions={[
                            {
                                node: (
                                    <span style={{ verticalAlign: 'middle' }}>
                                        {locale.addCodeholdersCount(this.selected.size)}
                                    </span>
                                ),
                            },
                            {
                                icon: <DoneIcon style={{ verticalAlign: 'middle' }} />,
                                label: locale.addCodeholdersDone,
                                action: () => {
                                    const groupId = task.options.group;
                                    task.drop();

                                    const queue = [...this.selected];

                                    const popQueue = () => {
                                        if (!queue.length) {
                                            // done
                                            this.context.navigate(`/administrado/grupoj/${groupId}`);
                                            return;
                                        }
                                        const codeholder = queue.shift();

                                        core.createTask(`adminGroups/addCodeholder`, {
                                            group: groupId,
                                        }, {
                                            codeholder,
                                        }).runOnceAndDrop().catch(err => {
                                            console.error(err); // eslint-disable-line no-console
                                            queue.push(codeholder);
                                        }).then(() => {
                                            popQueue();
                                        });
                                    };
                                    popQueue();
                                },
                            },
                        ]} />
                </div>
            );
        }
    },
    removeCodeholdersBatchTask ({ open, core, task }) {
        const items = task.parameters.items || [];

        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={locale.removeCodeholders}
                actionLabel={locale.removeButton}
                run={() => {
                    const groupId = task.options.group;

                    const queue = [...items];

                    return new Promise(resolve => {
                        const popQueue = () => {
                            if (!queue.length) {
                                // done
                                resolve();
                                task.runOnceAndDrop(); // signal success to task caller
                                return;
                            }
                            const codeholder = queue.shift();

                            core.createTask(`adminGroups/removeCodeholder`, {
                                group: groupId,
                            }, {
                                codeholder,
                            }).runOnceAndDrop().catch(err => {
                                console.error(err); // eslint-disable-line no-console
                                queue.push(codeholder);
                            }).then(() => {
                                popQueue();
                            });
                        };
                        popQueue();
                    });
                }}>
                {locale.removeCodeholdersAreYouSure(items.length)}
            </TaskDialog>
        );
    },
    addCodeholder ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={locale.addCodeholders}
                actionLabel={locale.addButton}
                running={task.running}
                run={() => task.runOnce()}>
                <Validator
                    component={TextField}
                    label="[[codeholder id]]"
                    value={task.parameters.codeholder || ''}
                    onChange={e => task.update({ codeholder: e.target.value })}
                    validate={id => {
                        if (!id) throw { error: '[[codeholder id is required]]' };
                    }} />
            </TaskDialog>
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
