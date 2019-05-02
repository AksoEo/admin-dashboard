import React from 'react';
import MemberField from './list/field-views';
import { FIELDS, DetailPos } from './list/fields';
import { transitionTitles } from '../../components/dom-utils';
import locale from '../../locale';

// TODO: use FIELDS -> editorType & ./editors for editors

/**
 * Renders the detail page for a member.
 */
export default class MemberDetail extends React.PureComponent {
    node = null;
    titleNode = null;

    transitionWith (transition) {
        if (!this.titleNode) return;

        this.node.classList.add('transition-in');

        transitionTitles(transition.node, this.titleNode, transition).then(() => {
            if (transition.node.parentNode) document.body.removeChild(transition.node);
        });
    }

    render () {
        // TODO: fetch member
        const member = {
            name: {
                firstName: 'Max',
                firstNameLegal: 'Max',
                lastName: 'Mustermann',
                lastNameLegal: 'Mustermann',
            },
            oldCode: 'mxms-o',
            newCode: 'maxmus',
            codeholderType: 'human',
            feeCountry: 'NL',
            age: 35,
            agePrimo: 34,
            email: 'max.mustermann@ekzemplo.com',
            enabled: true,
            isDead: false,
            birthdate: '1983-01-23',
            addressLatin: {
                country: 'NL',
                countryArea: 'Zuid-Holland',
                city: 'Rotterdam',
                cityArea: null,
                postalCode: '3015 BJ',
                streetAddress: 'Nieuwe Binnenweg 176',
            },
        };

        const fieldKeys = Object.keys(FIELDS)
            .filter(field => FIELDS[field].detailPos !== DetailPos.NONE);

        const title = fieldKeys
            .filter(field => FIELDS[field].detailPos === DetailPos.TITLE)
            .map(field => (
                <span className="title-item" key={field} data-field={field}>
                    <MemberField
                        field={field}
                        value={member[field]}
                        member={member}
                        selectedFields={fieldKeys}
                        transitionTitleRef={node => this.titleNode = node} />
                </span>
            ));

        const rows = fieldKeys
            .filter(field => FIELDS[field].detailPos === DetailPos.TABLE)
            .map(field => (
                <tr key={field}>
                    <td className="field-name">{locale.members.fields[field]}</td>
                    <td className="field-value">
                        <MemberField
                            field={field}
                            value={member[field]}
                            member={member}
                            selectedFields={fieldKeys} />
                    </td>
                </tr>
            ));

        return (
            <div className="app-subpage member-detail-page" ref={node => this.node = node}>
                <h1 className="title">{title}</h1>
                <table className="member-detail-table">
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            </div>
        );
    }
}
