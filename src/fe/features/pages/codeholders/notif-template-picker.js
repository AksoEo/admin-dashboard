import { h } from 'preact';
import { PureComponent, useState } from 'preact/compat';
import { Button } from 'yamdl';
import CloseIcon from '@material-ui/icons/Close';
import { FIELDS } from '../notif-templates/fields';
import StaticOverviewList from '../../../components/overview-list-static';
import OverviewListItem from '../../../components/overview-list-item';
import { notifTemplates, codeholders as locale } from '../../../locale';

const SELECTED_FIELDS = [
    { id: 'org', sorting: 'none' },
    { id: 'name', sorting: 'asc' },
    { id: 'description', sorting: 'none' },
];
const REDUCED_FIELDS = {
    org: FIELDS.org,
    name: FIELDS.name,
    description: FIELDS.description,
};

// TODO: maybe refactor this into a generic component if this is used elsewhere?

/// Big notif template picker used in the "send notification" page.
///
/// Will only show notifs with intent "codeholder".
export default class NotifTemplatePicker extends PureComponent {
    render ({ value, onChange, onChangeOrg }) {
        const onRemove = () => {
            onChange(null);
            onChangeOrg(null);
        };

        let contents = null;
        if (value) {
            contents = <TemplatePreview id={value} onRemove={onRemove} onLoadOrg={onChangeOrg} />;
        } else {
            contents = <TemplatePicker onChange={onChange} />;
        }

        return (
            <div class="notif-template-picker">
                {contents}
            </div>
        );
    }
}

function TemplatePreview ({ id, onLoadOrg, onRemove }) {
    return (
        <div class="notif-template-picked">
            <OverviewListItem
                doFetch compact
                view="notifTemplates/template"
                skipAnimation
                id={id}
                selectedFields={SELECTED_FIELDS}
                fields={FIELDS}
                index={0}
                locale={notifTemplates.fields}
                onData={data => onLoadOrg(data.org)} />
            <Button class="remove-picked" onClick={onRemove}>
                <CloseIcon style={{ verticalAlign: 'middle' }} />
            </Button>
        </div>
    );
}

function TemplatePicker ({ onChange }) {
    const [offset, setOffset] = useState(0);

    return (
        <div class="notif-template-picker-inner">
            <StaticOverviewList
                task="notifTemplates/list"
                view="notifTemplates/template"
                fields={REDUCED_FIELDS}
                sorting={{ name: 'asc' }}
                jsonFilter={{
                    intent: 'codeholder',
                }}
                offset={offset}
                onSetOffset={setOffset}
                limit={10}
                locale={notifTemplates.fields}
                onItemClick={id => {
                    onChange(id);
                }}
                emptyLabel={locale.notifTemplates.empty}
                compact />
        </div>
    );
}
