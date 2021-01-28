import { h } from 'preact';
import { Fragment } from 'preact/compat';
import HistoryIcon from '@material-ui/icons/History';
import { Link } from '../router';
import { deepEq } from '../../util';
import TinyProgress from './tiny-progress';
import './detail-fields.less';

/// Renders a detail view's fields in a table.
///
/// # Props
/// - data: loaded data
/// - editing: editing state
/// - edit/onEditChange: editing copy. Is not necessarily synchronized with `editing`
/// - fields: object { [client field id]: field spec }, with field spec being an object:
///    - component: field editor component { value, onChange, editing, item }
///    - isEmpty: (optional) (field value, item) => bool
///    - virtual: (optional) list of actual fields this virtual field corresponds to
/// - header: like a field editor component, but without value, and with onItemChange
/// - footer: like header
/// - locale: object { fields: { field names... } }
/// - makeHistoryLink: if set, should be a callback that returns the url for the given field’s
///   history
/// - compact: force compact
/// - userData: arbitrary user data passed to fields
/// - wideExtra: bool, if true will make extra space wider
export default function DetailFields ({
    data,
    editing,
    edit,
    onEditChange,
    fields,
    header: Header,
    footer: Footer,
    locale,
    makeHistoryLink,
    compact,
    userData,
    wideExtra,
}) {
    const itemData = editing ? (edit || data) : data;
    const fieldProps = {
        editing,
        item: itemData,
        originalItem: data,
        onItemChange: item => onEditChange(item),
        userData,
        slot: 'detail',
    };

    const createHistoryLink = field => makeHistoryLink && (
        <Link
            class="history-link"
            target={makeHistoryLink(field, itemData)}>
            <HistoryIcon style={{ verticalAlign: 'middle' }} />
        </Link>
    );
    const canReadHistory = !!makeHistoryLink;

    let header = null;
    const items = [];
    const emptyItems = [];
    let footer = null;

    if (Header) {
        header = <Header {...fieldProps} createHistoryLink={createHistoryLink} canReadHistory={canReadHistory} />;
    }
    if (Footer) {
        footer = <Footer {...fieldProps} createHistoryLink={createHistoryLink} canReadHistory={canReadHistory} />;
    }

    for (const fieldId in fields) {
        const field = fields[fieldId];
        const FieldComponent = field.component;

        if (field.shouldHide && field.shouldHide(itemData, editing, userData)) continue;

        const isNotLoaded = field.virtual
            ? field.virtual.map(x => itemData[x] === undefined).reduce((a, b) => a || b, false)
            : itemData[fieldId] === undefined;
        const isEmpty = !isNotLoaded && !editing
            && (field.isEmpty ? field.isEmpty(itemData[fieldId], itemData) : !itemData[fieldId]);
        const hasDiff = edit && data
            && !deepEq(data[fieldId], edit[fieldId]);

        let idClass = 'detail-field-id';
        if (isEmpty) idClass += ' is-empty';
        if (hasDiff) idClass += ' has-diff';

        let historyLink = null;
        if (!editing) {
            if (makeHistoryLink && field.history) historyLink = createHistoryLink(fieldId);
            else if (makeHistoryLink) historyLink = <span class="history-link-placeholder" />;
        }

        const itemId = (
            <div class={idClass} key={'i' + fieldId} data-id={fieldId}>
                {locale.fields[fieldId]}
            </div>
        );
        const itemContents = (
            <div class="detail-field-editor" key={'e' + fieldId}>
                {isNotLoaded ? (
                    <TinyProgress class="detail-field-loading" />
                ) : isEmpty ? (
                    <div class="detail-field-empty">—</div>
                ) : (
                    <FieldComponent
                        value={itemData[fieldId]}
                        onChange={value => {
                            onEditChange({
                                ...itemData,
                                [fieldId]: value,
                            });
                        }}
                        {...fieldProps} />
                )}
            </div>
        );

        let fieldExtra;
        if (field.extra) {
            fieldExtra = <field.extra value={itemData[fieldId]} {...fieldProps} />;
        }

        const itemExtra = (
            <div class="detail-field-extra">
                {fieldExtra}
                {historyLink}
            </div>
        );

        if (isEmpty) {
            // empty fields go below
            emptyItems.push(itemId, itemExtra, itemContents);
        } else {
            items.push(itemId, itemExtra, itemContents);
        }
    }

    return (
        <Fragment>
            {header}
            <div class={'detail-fields' + (compact ? ' is-compact' : '') + (wideExtra ? ' wide-extra' : '')}>
                {items}
                {emptyItems}
            </div>
            {footer}
        </Fragment>
    );
}
