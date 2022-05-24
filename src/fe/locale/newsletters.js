export const newsletters = {
    title: 'Bultenoj',
    detailTitle: 'Bulteno',
    search: {
        placeholders: {
            name: '[[Search names…]]',
            description: '[[Search descriptions…]]',
        },
    },
    fields: {
        org: 'Organizo',
        name: 'Nomo',
        description: 'Priskribo',
        public: '[[public]]',
        numSubscribers: '[[numSubscribers]]',
    },
    create: {
        title: 'Krei bultenon',
        button: 'Krei',
        menuItem: 'Krei bultenon',
    },
    update: {
        menuItem: 'Redakti',
        title: 'Redakti bultenon',
        button: 'Aktualigi',
    },
    delete: {
        menuItem: 'Forigi',
        title: 'Forigi bultenon',
        button: 'Forigi',
        description: 'Ĉu vi certas, ke vi volas forigi tiun ĉi bultenon? Ne eblas malfari tiun ĉi agon.',
    },
    send: {
        button: '[[Send a newsletter]]',
        description: '[[To send a newsletter, please go to notif templates and create a notif template, maybe by copying the appropriate notif template^2 (i imagine youll have templates for this...). Then come back here to send it.]]',
        pick: '[[Select notif template]]',
        pickSearchPlaceholder: '[[Search names…]]',
        send: '[[Send newsletter]]',
    },
};

export const newsletterUnsubs = {
    title: 'Malabonoj',
    detailTitle: 'Malabono',
    fields: {
        time: 'Horo',
        reason: '[[Reason]]',
        description: 'Priskribo',
        subscriberCount: '[[Sub. count afterwards]]',
    },
    reasons: {
        0: '[[Other/unspecified]]',
        1: '[[I never subscribed]]',
        2: '[[It’s too frequent]]',
        3: '[[Email doesn’t render]]',
        4: '[[Don’t care anymore]]',
    },
};
