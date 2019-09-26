import { h } from 'preact';
import { Button } from 'yamdl';
import FIELDS from './table-fields';
import data from '../../../../components/data';
import { Link } from '../../../../router';
import locale from '../../../../locale';

const DETAIL_FIELDS = Object.fromEntries(Object.entries(FIELDS)
    .map(([id, { component, stringify }]) => ([id, {
        component ({ value }) {
            return h(component, { value: value[id], item: value });
        },
        hasDiff: () => false,
        isEmpty: value => !stringify(value[id], value),
    }])));

DETAIL_FIELDS.codeholder.component = function Codeholder ({ value }) {
    return (
        <div class="request-codeholder">
            <data.ueaCode.renderer value={value.newCode} />
            {' '}
            <Link target={`/membroj/${value.codeholderId}`}>
                <Button>
                    {locale.administration.log.viewCodeholder}
                </Button>
            </Link>
        </div>
    );
};

DETAIL_FIELDS.query.component = function Query ({ value }) {
    return (
        <pre class="request-query">
            {JSON.stringify(value.query, null, 4)}
        </pre>
    );
};

export default DETAIL_FIELDS;
