import { h } from 'preact';
import moment from 'moment';
import locale from '../../../../locale';
import { IdUEACode } from '../../../../components/data/uea-code';

const identityComponent = {
    component: ({ value }) => value ? '' + value : '',
    stringify: x => x ? '' + x : '',
};

export default {
    time: {
        sortable: true,
        component ({ value }) {
            return value ? moment(value * 1000).format('YYYY-MM-DDTHH:mm:ssZ') : '';
        },
        stringify (value) {
            return value ? moment(value * 1000).format('YYYY-MM-DDTHH:mm:ssZ') : '';
        },
    },
    codeholder: {
        sortable: true,
        component ({ value }) {
            return <IdUEACode id={value} />;
        },
        stringify (value, item) {
            return item.newCode;
        },
    },
    apiKey: {
        sortable: true,
        ...identityComponent,
    },
    ip: {
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
                ? locale.administration.log.query.some
                : locale.administration.log.query.none;
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
        ...identityComponent,
    },
    resLocation: identityComponent,
};
