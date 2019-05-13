import React from 'react';
import PropTypes from 'prop-types';
import MembersList from './list';
import { setPendingTransition } from './detail';
import { routerContext } from '../../router';
import { cloneNodeInScreenSpace } from '../../components/dom-utils';
import './style';

/** The members’ page. */
export default class MembersPage extends React.PureComponent {
    static propTypes = {
        setBackButtonVisible: PropTypes.func.isRequired,
        query: PropTypes.string.isRequired,
    };

    static contextType = routerContext;

    openMember = (id, titleNode) => {
        if (titleNode) {
            const transition = cloneNodeInScreenSpace(titleNode);
            setPendingTransition(transition);
            document.body.appendChild(transition.node);
        }
        setTimeout(() => {
            this.context.navigate(this.getMemberPath(id));
        }, 100);
    };

    getMemberPath = id => {
        return `/membroj/${id}`;
    };

    render () {
        return (
            <div className="app-page members-page">
                <MembersList
                    openMember={this.openMember}
                    getMemberPath={this.getMemberPath}
                    query={this.props.query} />
            </div>
        );
    }
}
