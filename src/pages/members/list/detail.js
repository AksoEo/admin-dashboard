import React from 'react';
import { Spring, lerp } from '../../../animation';
import MemberField, { Position } from './field-views';
import { FIELDS, DetailPos } from './fields';
import locale from '../../../locale';

/**
 * Renders the detail page for a member.
 */
export default class MemberDetail extends React.PureComponent {
    node = null;
    titleNode = null;

    transitionWith (transition) {
        if (!this.titleNode) return;

        const titleNode = this.titleNode;

        const startRect = transition;
        const endRect = titleNode.getBoundingClientRect();

        transition.node.style.transformOrigin = '0 0';
        titleNode.style.transformOrigin = '0 0';
        titleNode.style.opacity = 0;

        this.node.classList.add('transition-in');

        const spring = new Spring(1.3, 0.4);
        spring.on('update', p => {
            const xp = Math.pow(p, 0.8);
            const yp = Math.pow(p, 2);

            const tx = lerp(startRect.left, endRect.left, xp);
            const ty = lerp(startRect.top, endRect.top, yp);
            const tsx = lerp(1, endRect.width / startRect.width, p);
            const tsy = lerp(1, endRect.height / startRect.height, p);

            transition.node.style.transform = `translate(${tx}px, ${ty}px) scale(${tsx}, ${tsy})`;
            transition.node.style.opacity = 1 - p;

            const ux = lerp(startRect.left - endRect.left, 0, xp);
            const uy = lerp(startRect.top - endRect.top, 0, yp);
            const usx = lerp(startRect.width / endRect.width, 1, p);
            const usy = lerp(startRect.height / endRect.height, 1, p);

            titleNode.style.transform = `translate(${ux}px, ${uy}px) scale(${usx}, ${usy})`;
            titleNode.style.opacity = p;

            if (p === 1 && transition.node.parentNode) {
                document.body.removeChild(transition.node);
            }
        });
        spring.target = 1;
        spring.start();
    }

    render () {
        // TODO: fetch member
        const member = {
            name: {
                firstName: 'Example',
                firstNameLegal: 'Example',
                lastName: 'McExampleface',
                lastNameLegal: 'McExampleface',
            },
            oldCode: 'exam-l',
            newCode: 'exampl',
            codeholderType: 'human',
            feeCountry: 'NL',
            age: 35,
            email: 'exam@ple.example',
            addressLatin: {
                country: 'NL',
                countryArea: 'Holland',
                city: 'Amsterdam',
                cityArea: 'Idontknow',
                postalCode: '12345',
                streetAddress: 'Idontknow 12',
            },
        };

        const fieldKeys = Object.keys(FIELDS);
        const title = fieldKeys
            .filter(field => FIELDS[field].detailPos === DetailPos.TITLE)
            .map(field => (
                <span className="title-item" key={field} data-field={field}>
                    <MemberField
                        field={field}
                        value={member[field]}
                        member={member}
                        position={Position.COLUMN}
                        templateFields={fieldKeys}
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
                            position={Position.COLUMN}
                            templateFields={fieldKeys} />
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
