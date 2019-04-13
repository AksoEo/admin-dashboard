import React from 'react';
import { Spring, lerp, clamp } from '../../../animation';
import MemberField, { Position } from './field-views';
import { FIELDS, DetailPos } from './fields';
import locale from '../../../locale';

/** Largest allowed vertical movement in the title transition. */
const MAX_DELTA_Y = 200;

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

        const reduceMotion = Math.abs(endRect.top - startRect.top) > MAX_DELTA_Y;
        const yDir = Math.sign(endRect.top - startRect.top);

        const spring = new Spring(1.3, 0.4);
        spring.on('update', p => {
            const xp = Math.pow(p, 0.8);
            const yp = Math.pow(p, 2);

            const tEndY = reduceMotion ? startRect.top + yDir * MAX_DELTA_Y / 2 : endRect.top;
            const tsp = reduceMotion ? p / 2 : p;

            const tx = lerp(startRect.left, endRect.left, xp);
            const ty = lerp(startRect.top, tEndY, reduceMotion ? p * 1.5 : yp);
            const tsx = lerp(1, endRect.width / startRect.width, tsp);
            const tsy = lerp(1, endRect.height / startRect.height, tsp);

            transition.node.style.transform = `translate(${tx}px, ${ty}px) scale(${tsx}, ${tsy})`;
            transition.node.style.opacity = reduceMotion ? clamp(1 - p * 2, 0, 1) : 1 - p;

            const uStartY = reduceMotion ? -yDir * MAX_DELTA_Y / 2 : startRect.top - endRect.top;
            const usp = reduceMotion ? 0.5 + p / 2 : p;

            const ux = lerp(startRect.left - endRect.left, 0, reduceMotion ? usp : xp);
            const uy = lerp(uStartY, 0, reduceMotion ? p * 1.5 - 0.5 : yp);
            const usx = lerp(startRect.width / endRect.width, 1, usp);
            const usy = lerp(startRect.height / endRect.height, 1, usp);

            titleNode.style.transform = `translate(${ux}px, ${uy}px) scale(${usx}, ${usy})`;
            titleNode.style.opacity = reduceMotion ? clamp(p * 2 - 1, 0, 1) : p;

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
            email: 'max.mustermann@ekzemplo.com',
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
