import React from 'react';
import PropTypes from 'prop-types';
import { UEACode } from 'akso-client';
import MembersList from './list';
import MemberDetail from './list/detail';
import { routerContext } from '../../router';
import { cloneNodeInScreenSpace } from '../../components/dom-utils';
import './style';

/** The members’ page. */
export default class MembersPage extends React.PureComponent {
    static propTypes = {
        path: PropTypes.arrayOf(PropTypes.string).isRequired,
        setBackButtonVisible: PropTypes.func.isRequired,
    };

    static contextType = routerContext;

    pendingTransition = null;

    openMember = (id, titleNode) => {
        if (titleNode) {
            const transition = cloneNodeInScreenSpace(titleNode);
            this.pendingTransition = transition;
            document.body.appendChild(transition.node);
        }
        setTimeout(() => {
            this.context.navigate(`/membroj/${id}`);
        }, 100);
    };

    isDetailPage (props = this.props) {
        return UEACode.validate(props.path[0]);
    }

    updateBackButtonVisibility (props) {
        this.props.setBackButtonVisible(this.isDetailPage(props));
    }

    componentDidMount () {
        this.updateBackButtonVisibility();
    }

    componentWillUpdate (newProps) {
        this.updateBackButtonVisibility(newProps);
    }

    render () {
        const isDetailPage = this.isDetailPage();

        let contents = null;

        if (isDetailPage) {
            contents = (
                <MemberDetail
                    ref={node => {
                        if (this.pendingTransition) {
                            node.transitionWith(this.pendingTransition);
                            this.pendingTransition = null;
                        }
                    }} />
            );
        } else {
            contents = <MembersList openMember={this.openMember} />;
        }

        return (
            <div className="app-page members-page">
                {contents}
            </div>
        );
    }
}
