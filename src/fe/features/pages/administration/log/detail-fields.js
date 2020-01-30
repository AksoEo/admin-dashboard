import { h } from 'preact';
import { Button } from '@cpsdqs/yamdl';
import FIELDS from './table-fields';
import ObjectViewer from '../../../../components/object-viewer';
import { Link } from '../../../../router';
import { httpLog as locale } from '../../../../locale';

const DETAIL_FIELDS = Object.fromEntries(Object.entries(FIELDS)
    .map(([id, { component, isEmpty = (x => !x) }]) => ([id, {
        component,
        isEmpty,
    }])));

const IdentityComponent = DETAIL_FIELDS.identity.component;
DETAIL_FIELDS.identity.component = function Identity ({ value }) {
    if (!value || value.type === 'none') return;

    const linkTarget = value.type === 'codeholder'
        ? `/membroj/${value.id}`
        : `/administrado/klientoj/${value.id}`;
    const linkLabel = value.type === 'codeholder'
        ? locale.viewCodeholder
        : locale.viewClient;

    return (
        <div class="request-identity">
            <IdentityComponent value={value} />
            {' '}
            <Link target={linkTarget}>
                <Button>
                    {linkLabel}
                </Button>
            </Link>
        </div>
    );
};

DETAIL_FIELDS.query.component = function Query ({ value }) {
    if (!value) return;
    return (
        <pre class="request-query">
            <ObjectViewer value={value} />
        </pre>
    );
};

export default DETAIL_FIELDS;
