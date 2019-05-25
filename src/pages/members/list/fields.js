/**
 * “Enum” of sorting types.
 */
export const Sorting = {
    NONE: 0,
    DESC: 1,
    ASC: 2,
};

/** Position in the detail view. */
export const DetailPos = {
    NONE: -1,
    TITLE: 0,
    TABLE: 1,
};

// TODO: order fields in some sensible order

/** List of all member fields. */
export const FIELDS = {
    codeholderType: {
        sortable: true,
        detailPos: DetailPos.TITLE,
        editorType: 'codeholderType',
    },
    name: {
        sortable: true,
        detailPos: DetailPos.TITLE,
        editorType: 'name',
    },
    code: {
        sortable: true,
        detailPos: DetailPos.TABLE,
        editorType: 'code',
    },
    age: {
        sortable: true,
        detailPos: DetailPos.TABLE,
        editorType: 'number',
    },
    birthdate: {
        sortable: true,
        detailPos: DetailPos.TABLE,
        editorType: 'date',
    },
    deathdate: {
        sortable: true,
        detailPos: DetailPos.TABLE,
        editorType: 'date',
    },
    email: {
        detailPos: DetailPos.TABLE,
        editorType: 'string',
    },
    addressLatin: {
        sortable: true,
        detailPos: DetailPos.TABLE,
        editorType: 'address',
    },
    addressCity: {
        sortable: true,
        detailPos: DetailPos.NONE,
    },
    addressCountryArea: {
        sortable: true,
        detailPos: DetailPos.NONE,
    },
    country: {
        sortable: true,
        detailPos: DetailPos.TABLE,
        editorType: 'country',
    },
    officePhone: {
        detailPos: DetailPos.TABLE,
        editorType: 'phone',
    },
    cellphone: {
        detailPos: DetailPos.TABLE,
        editorType: 'phone',
    },
    landlinePhone: {
        detailPos: DetailPos.TABLE,
        editorType: 'phone',
    },
    profession: {
        detailPos: DetailPos.TABLE,
        editorType: 'string',
    },
    notes: {
        hideColumn: true,
        detailPos: DetailPos.TABLE,
        editorType: 'string',
    },
};
