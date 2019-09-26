import moment from 'moment';

const identityComponent = {
    component: ({ value }) => value ? '' + value : '',
    stringify: x => x ? '' + x : '',
};

export default {
    time: {
        sortable: true,
        component ({ value }) {
            return value ? moment(value * 1000).format('D[-a de] MMMM Y, h:mm:ss.SSS') : '';
        },
        stringify (value) {
            return value ? moment(value * 1000).format('D[-a de] MMMM Y, h:mm:ss.SSS') : '';
        },
    },
    codeholderId: {
        sortable: true,
        ...identityComponent,
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
            return JSON.stringify(value); // TODO: prettify
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
