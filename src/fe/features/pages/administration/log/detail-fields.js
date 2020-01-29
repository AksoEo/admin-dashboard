import { h } from 'preact';
import { Button } from '@cpsdqs/yamdl';
import FIELDS from './table-fields';
import { IdUEACode } from '../../../../components/data/uea-code';
import ObjectViewer from '../../../../components/object-viewer';
import { Link } from '../../../../router';
import locale from '../../../../locale';

const DETAIL_FIELDS = Object.fromEntries(Object.entries(FIELDS)
    .map(([id, { component, isEmpty = (x => !x) }]) => ([id, {
        component,
        isEmpty,
    }])));

DETAIL_FIELDS.codeholder.component = function Codeholder ({ item }) {
    if (!item) return;
    return (
        <div class="request-codeholder">
            <IdUEACode id={item.codeholder} />
            {' '}
            <Link target={`/membroj/${item.codeholder}`}>
                <Button>
                    {locale.administration.log.viewCodeholder}
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
