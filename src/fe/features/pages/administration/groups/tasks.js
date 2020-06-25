import { h, Component } from 'preact';
import { TextField, AppBarProxy, Button, MenuIcon } from '@cpsdqs/yamdl';
import DoneIcon from '@material-ui/icons/Done';
import SavePerms from '../perms-editor/save';
import { adminGroups as locale } from '../../../../locale';
import { Field, Validator } from '../../../../components/form';
import TaskDialog from '../../../../components/task-dialog';
import ChangedFields from '../../../../components/changed-fields';
import { IdUEACode } from '../../../../components/data/uea-code';
import { apiKey } from '../../../../components/data';
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
                        <Field>
                            <Validator
                                outline
                                component={TextField}
                                label={locale.fields.name}
                                value={task.parameters.name || ''}
                                onChange={e => task.update({ name: e.target.value })}
                                validate={name => {
                                    if (!name) throw { error: locale.nameRequired };
                                }} />
                        </Field>
                        <Field>
                            <Validator
                                outline
                                component={TextField}
                                label={locale.fields.description}
                                value={task.parameters.description || ''}
                                onChange={e => task.update({ description: e.target.value })}
                                validate={() => {}} />
                        </Field>
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
                running={task.running}
                run={() => task.runOnce()}>
                <ChangedFields
                    changedFields={task.options._changedFields}
                    locale={locale.fields} />
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

                                    const queue = [...this.selected];

                                    const popQueue = () => {
                                        if (!queue.length) {
                                            // done
                                            this.context.navigate(`/administrado/grupoj/${groupId}`);
                                            task.run();
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
    addClientsBatchTask: class AddClientTask extends Component {
        static contextType = routerContext;

        selected = new Set();

        constructor (props) {
            super(props);

            this.contextTask = {
                lockSidebar: true,
                action: 'select-clients',
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
                this.context.navigate(`/administrado/klientoj`);
            }, 50);
        }

        render ({ open, core, task }) {
            if (!open) return null;

            return (
                <div class="add-client-task">
                    <ContextualAction
                        task={this.contextTask}
                        onClose={() => task.drop()} />
                    <AppBarProxy
                        class="context-action-app-bar"
                        priority={20}
                        menu={<Button small icon onClick={() => task.drop()}>
                            <MenuIcon type="close" />
                        </Button>}
                        title={locale.addClients}
                        actions={[
                            {
                                node: (
                                    <span style={{ verticalAlign: 'middle' }}>
                                        {locale.addClientsCount(this.selected.size)}
                                    </span>
                                ),
                            },
                            {
                                icon: <DoneIcon style={{ verticalAlign: 'middle' }} />,
                                label: locale.addClientsDone,
                                action: () => {
                                    const groupId = task.options.group;

                                    const queue = [...this.selected];

                                    const popQueue = () => {
                                        if (!queue.length) {
                                            // done
                                            this.context.navigate(`/administrado/grupoj/${groupId}`);
                                            task.run();
                                            return;
                                        }
                                        const client = queue.shift();

                                        core.createTask(`adminGroups/addClient`, {
                                            group: groupId,
                                        }, {
                                            client,
                                        }).runOnceAndDrop().catch(err => {
                                            console.error(err); // eslint-disable-line no-console
                                            queue.push(client);
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
    removeClientsBatchTask ({ open, core, task }) {
        const items = task.parameters.items || [];

        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={locale.removeClients}
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
                            const client = queue.shift();

                            core.createTask(`adminGroups/removeClient`, {
                                group: groupId,
                            }, {
                                client,
                            }).runOnceAndDrop().catch(err => {
                                console.error(err); // eslint-disable-line no-console
                                queue.push(client);
                            }).then(() => {
                                popQueue();
                            });
                        };
                        popQueue();
                    });
                }}>
                {locale.removeClientsAreYouSure(items.length)}
            </TaskDialog>
        );
    },
    // TODO: improve these two
    addCodeholder ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={locale.addCodeholders}
                actionLabel={locale.addButton}
                running={task.running}
                run={() => task.runOnce()}>
                {task.parameters.codeholder ? <IdUEACode id={task.parameters.codeholder} /> : ''}
            </TaskDialog>
        );
    },
    addClient ({ open, task }) {
        return (
            <TaskDialog
                open={open}
                onClose={() => task.drop()}
                title={locale.addClients}
                actionLabel={locale.addButton}
                running={task.running}
                run={() => task.runOnce()}>
                {task.parameters.client ? <apiKey.renderer value={task.parameters.client} /> : ''}
            </TaskDialog>
        );
    },

    setPermissions ({ open, core, task }) {
        return (
            <SavePerms
                open={open}
                core={core}
                task={task}
                pxTask="adminGroups/setPermissionsPX"
                mrTask="adminGroups/setPermissionsMR" />
        );
    },
};
