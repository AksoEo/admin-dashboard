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

/**
 * List of all member fields.

 * - sortable: whether or not the field should have a sorting control
 */
export const FIELDS = {
    codeholderType: {
        fixedColWidth: 56,
        sortable: true,
        detailPos: DetailPos.TITLE,
    },
    name: {
        sortable: true,
        detailPos: DetailPos.TITLE,
    },
    code: {
        sortable: true,
        detailPos: DetailPos.TABLE,
    },
    enabled: {
        detailPos: DetailPos.TABLE,
    },
    age: {
        sortable: true,
        detailPos: DetailPos.TABLE,
    },
    birthdate: {
        sortable: true,
        detailPos: DetailPos.TABLE,
    },
    email: {
        detailPos: DetailPos.TABLE,
    },
    addressLatin: {
        sortable: true,
        detailPos: DetailPos.TABLE,
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
    },
    officePhone: {
        detailPos: DetailPos.TABLE,
    },
    cellphone: {
        detailPos: DetailPos.TABLE,
    },
    landlinePhone: {
        detailPos: DetailPos.TABLE,
    },
    isDead: {
        detailPos: DetailPos.TABLE,
    },
    profession: {
        detailPos: DetailPos.TABLE,
    },
    notes: {
        detailPos: DetailPos.TABLE,
    },
};
