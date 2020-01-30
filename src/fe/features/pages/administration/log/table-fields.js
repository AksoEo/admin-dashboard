import { h } from 'preact';
import moment from 'moment';
import { timestampFormat, httpLog as locale } from '../../../../locale';
import { IdUEACode } from '../../../../components/data/uea-code';
import { apiKey } from '../../../../components/data';

const identityComponent = {
    component: ({ value }) => value ? '' + value : '',
    stringify: x => x ? '' + x : '',
};

export default {
    time: {
        sortable: true,
        component ({ value }) {
            return value ? moment(value * 1000).format(timestampFormat) : '';
        },
        stringify (value) {
            return value ? moment(value * 1000).format(timestampFormat) : '';
        },
    },
    identity: {
        sortable: true,
        component ({ value }) {
            if (value.type === 'codeholder') {
                return <IdUEACode id={value.id} />;
            } else if (value.type === 'apiKey') {
                return <apiKey.renderer value={value.id} />;
            } else {
                return null;
            }
        },
        stringify () {
            // TODO
            throw new Error('unimplemented: stringify identity');
        },
    },
    ip: {
        weight: 2,
        sortable: true,
        ...identityComponent,
    },
    origin: {
        sortable: true,
        ...identityComponent,
    },
    userAgent: identityComponent,
    userAgentParsed: identityComponent,
    method: {
        weight: 0.5,
        sortable: true,
        ...identityComponent,
    },
    path: {
        sortable: true,
        ...identityComponent,
    },
    query: {
        component ({ value }) {
            return value
                ? locale.query.some
                : locale.query.none;
        },
        stringify (value) {
            return JSON.stringify(value);
        },
    },
    resStatus: {
        sortable: true,
        ...identityComponent,
    },
    resTime: {
        sortable: true,
        component ({ value }) {
            return (+value).toLocaleString('fr-FR') + ' ms';
        },
        stringify (value) {
            return (+value).toLocaleString('fr-FR') + ' ms';
        },
    },
    resLocation: identityComponent,
};
