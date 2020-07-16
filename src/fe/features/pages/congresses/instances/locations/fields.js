export const FIELDS = {
    type: {
        component ({ value }) {
            return value;
        },
    },
    icon: {
        slot: 'icon',
        component ({ value }) {
            return value;
        },
    },
    name: {
        slot: 'title',
        component ({ value }) {
            return value;
        },
    },
    description: {
        slot: 'body',
        skipLabel: true,
        component ({ value }) {
            return value;
        },
    },
};
