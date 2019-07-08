import React from 'react';
import PropTypes from 'prop-types';
import MemberField from './list/field-views';
import { FIELDS, DetailPos } from './list/fields';
import { transitionTitles } from '../../components/dom-utils';
import locale from '../../locale';
import client from '../../client';
import './detail.less';

// TODO: use FIELDS -> editorType & ./editors for editors

let pendingTransitions = [];
export function setPendingTransition (transition) {
    pendingTransitions.push(transition);
}

function flushPendingTransitions () {
    for (const item of pendingTransitions) {
        if (item.node.parentNode) item.node.parentNode.removeChild(item.node);
    }
    pendingTransitions = [];
}

/**
 * Renders the detail page for a member.
 */
export default class MemberDetail extends React.PureComponent {
    static propTypes = {
        match: PropTypes.array.isRequired,
    };

    node = null;
    titleNode = null;

    state = {
        transitioning: false,
        member: {},
        error: null,
    }

    transitionWith (transition) {
        if (!this.titleNode) {
            if (transition.node.parentNode) document.body.removeChild(transition.node);
            return;
        }

        this.node.classList.add('transition-in');

        this.setState({ transitioning: true });

        transitionTitles(transition.node, this.titleNode, transition).then(() => {
            if (transition.node.parentNode) document.body.removeChild(transition.node);
            this.setState({ transitioning: false });
        });
    }

    componentDidMount () {
        if (pendingTransitions.length) {
            this.transitionWith(pendingTransitions.pop());
            flushPendingTransitions();
        }

        const id = this.props.match[1];
        // all of them
        const fields = [
            'id', 'oldCode', 'newCode', 'codeholderType', 'addressCountryGroups', 'feeCountry',
            'feeCountryGroups', 'addressLatin.country', 'addressLatin.countryArea',
            'addressLatin.city', 'addressLatin.cityArea', 'addressLatin.streetAddress',
            'addressLatin.postalCode', 'addressLatin.sortingCode', 'searchAddress', 'membership',
            'email', 'enabled', 'notes', 'officePhone', 'officePhoneFormatted', 'isDead',
            'deathdate', 'hasProfilePicture', 'firstName', 'firstNameLegal', 'lastName',
            'lastNameLegal', 'honorific', 'birthdate', 'age', 'agePrimo', 'profession',
            'landlinePhone', 'landlinePhoneFormatted', 'cellphone', 'cellphoneFormatted',
            'fullName', 'nameAbbrev',
        ];

        client.get(`/codeholders/${id}`, { fields }).then(response => {
            this.setState({ member: response.body, error: null });
        }).catch(error => this.setState({ error }));
    }

    render () {
        let contents;

        if (this.state.error) {
            // TODO: proper error display
            contents = (
                <div className="error">{this.state.error.toString()}</div>
            );
        } else {
            const fieldKeys = Object.keys(FIELDS)
                .filter(field => FIELDS[field].detailPos !== DetailPos.NONE);

            const title = fieldKeys
                .filter(field => FIELDS[field].detailPos === DetailPos.TITLE)
                .map(field => (
                    <span className="title-item" key={field} data-field={field}>
                        <MemberField
                            field={field}
                            value={this.state.member[field]}
                            member={this.state.member}
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
                                value={this.state.member[field]}
                                member={this.state.member}
                                selectedFields={fieldKeys} />
                        </td>
                    </tr>
                ));

            let titleClassName = 'title';
            if (this.state.transitioning) titleClassName += ' transitioning';

            contents = [
                <h1 key="title" className={titleClassName}>{title}</h1>,
                <table key="table" className="member-detail-table">
                    <tbody>
                        {rows}
                    </tbody>
                </table>,
            ];
        }

        return (
            <div className="app-page member-detail-page" ref={node => this.node = node}>
                {contents}
            </div>
        );
    }
}
