import { h } from 'preact';
import { PureComponent, Fragment } from 'preact/compat';
import PropTypes from 'prop-types';
import { Dialog, Button, TextField } from 'yamdl';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import SaveIcon from '@material-ui/icons/Save';
import JSON5 from 'json5';
import Form, { Validator } from '../form';
import DataList from '../data-list';
import locale from '../../locale';
import client from '../../client';

const Action = {
    NONE: 'none',
    LOAD: 'load',
    SAVE: 'save',
    SAVING: 'saving',
};

export default class SavedFiltersBar extends PureComponent {
    static propTypes = {
        jsonFilterEnabled: PropTypes.bool,
        jsonFilter: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        canSaveFilters: PropTypes.bool,
        onSetJSONFilter: PropTypes.func.isRequired,
        onSetJSONFilterEnabled: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
    };

    state = {
        action: Action.NONE,
        saveError: null,
        name: '',
        description: '',
    };

    save = () => {
        this.setState({ action: Action.SAVING, saveError: null });

        try {
            const query = JSON5.parse(this.props.jsonFilter);

            client.post('/queries', {
                category: this.props.category,
                name: this.state.name,
                description: this.state.description || null,
                query,
            }).then(() => {
                this.setState({ action: Action.NONE });
            }).catch(err => {
                console.error('Failed to save query', err); // eslint-disable-line no-console
                this.setState({ action: Action.SAVE, saveError: err });
            });
        } catch (err) {
            this.setState({ action: Action.SAVE, saveError: err });
        }
    };

    isJSONFilterValid () {
        try {
            JSON5.parse(this.props.jsonFilter);
            return true;
        } catch (_) {
            return false;
        }
    }

    render () {
        const { jsonFilterEnabled } = this.props;

        return (
            <div className={'saved-filters-bar' + (jsonFilterEnabled ? '' : ' collapsed')}>
                <div className="saved-filters-inner">
                    {jsonFilterEnabled ? (
                        <Fragment>
                            <div>
                                <Button
                                    icon
                                    aria-label={locale.listView.savedFilters.load}
                                    onClick={() => this.setState({ action: Action.LOAD })}>
                                    <FolderOpenIcon />
                                </Button>
                                {this.props.canSaveFilters ? (
                                    <Button
                                        icon
                                        disabled={!this.isJSONFilterValid()}
                                        aria-label={locale.listView.savedFilters.save}
                                        onClick={() => this.setState({ action: Action.SAVE })}>
                                        <SaveIcon />
                                    </Button>
                                ) : null}
                            </div>
                            <Button
                                class="disable-json-button"
                                onClick={() => this.props.onSetJSONFilterEnabled(false)}>
                                {locale.listView.json.disable}
                            </Button>
                        </Fragment>
                    ) : (
                        <Button
                            class="saved-filters-button"
                            onClick={() => this.setState({ action: Action.LOAD })}>
                            {locale.listView.savedFilters.savedFilters}
                        </Button>
                    )}
                </div>
                <Dialog
                    open={this.state.action === Action.LOAD}
                    class="list-view-saved-filters-load"
                    backdrop
                    fullScreen={width => width < 500}
                    onClose={() => this.setState({ action: Action.NONE })}
                    title={locale.listView.savedFilters.load}>
                    <DataList
                        class="saved-filters-list"
                        onLoad={async (offset, limit) => {
                            const result = await client.get('/queries', {
                                offset,
                                limit,
                                fields: ['id', 'name', 'description', 'query'],
                                order: [['name', 'asc']],
                                filter: { category: this.props.category },
                            });

                            return {
                                totalItems: +result.res.headers.map['x-total-items'],
                                items: result.body,
                            };
                        }}
                        onItemClick={({ name, description, query }) => {
                            this.props.onSetJSONFilter(JSON5.stringify(query, {
                                space: '\t',
                            }));
                            this.setState({ name, description, action: Action.NONE });
                            if (!this.props.jsonFilterEnabled) {
                                this.props.onSetJSONFilterEnabled(true);
                                this.props.onSubmit();
                            }
                        }}
                        onRemove={item => client.delete(`/queries/${item.id}`)}
                        itemHeight={56}
                        renderItem={item => (
                            <Fragment>
                                <div class="item-name">{item.name}</div>
                                <div class="item-desc">{item.description}</div>
                            </Fragment>
                        )}
                        emptyLabel={locale.listView.savedFilters.empty} />
                </Dialog>
                <Dialog
                    open={this.state.action === Action.SAVE || this.state.action === Action.SAVING}
                    class="list-view-saved-filters-save"
                    backdrop
                    onClose={() => this.state.action === Action.SAVE
                        && this.setState({ action: Action.NONE })}
                    title={locale.listView.savedFilters.save}>
                    <Form onSubmit={() => this.save()}>
                        <div className="form-field">
                            <Validator
                                component={TextField}
                                class="text-field"
                                outline
                                label={locale.listView.savedFilters.name + '*'}
                                value={this.state.name}
                                onChange={e => this.setState({ name: e.target.value })}
                                validate={v => {
                                    if (!v) throw { error: locale.data.requiredField };
                                }} />
                        </div>
                        <div className="form-field">
                            <TextField
                                className="text-field"
                                outline
                                label={locale.listView.savedFilters.description}
                                value={this.state.description || ''}
                                onChange={e => this.setState({ description: e.target.value })} />
                        </div>
                        <div className="save-button-container">
                            <Button
                                type="submit"
                                class="save-button"
                                disabled={this.state.action === Action.SAVING}>
                                {locale.listView.savedFilters.save}
                            </Button>
                        </div>
                    </Form>
                    {this.state.saveError && (
                        <div className="save-error">
                            {locale.listView.savedFilters.error}
                        </div>
                    )}
                </Dialog>
            </div>
        );
    }
}
