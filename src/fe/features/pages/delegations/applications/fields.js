import { FIELDS as DELEGATE_FIELDS } from '../delegates/fields';

export const FIELDS = {
    org: DELEGATE_FIELDS.org,
    codeholderId: DELEGATE_FIELDS.codeholderId,
    subjects: DELEGATE_FIELDS.subjects,
    cities: DELEGATE_FIELDS.cities,
    countries: DELEGATE_FIELDS.countries,
    hosting: DELEGATE_FIELDS.hosting,
    tos: DELEGATE_FIELDS.tos,
    applicantNotes: {
        wantsCreationLabel: true,
        component ({ value }) {
            return '' + value;
        },
    },
    internalNotes: {
        wantsCreationLabel: true,
        component ({ value }) {
            return '' + value;
        },
    },
};
