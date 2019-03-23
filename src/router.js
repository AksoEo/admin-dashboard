import React from 'react';
import PropTypes from 'prop-types';
import HomeIcon from '@material-ui/icons/Home';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import AssessmentIcon from '@material-ui/icons/Assessment';
import GroupIcon from '@material-ui/icons/Group';
import PaymentIcon from '@material-ui/icons/Payment';
import HowToVoteIcon from '@material-ui/icons/HowToVote';

/**
 * A React context for in-app navigation.
 *
 * - `navigate: (string) => void`: function that may be called to navigate in-app
 * - `loginStateChanged: () => void`: function that may be called to notify the context creator
 *   that the login state has changed
 */
export const routerContext = React.createContext({
    navigate: null,
    loginStateChanged: null
});

/**
 * An in-app link.
 *
 * - `target: string`: required property that contains the `routerContext`→`navigate` argument.
 * @type {React.PureComponent}
 */
export const Link = React.memo(function Link (props) {
    return (
        <routerContext.Consumer>
            {context => (
                <span {...props} onClick={() => {
                    if (props.onClick) props.onClick();
                    context.navigate(props.target);
                }}>
                    {props.children}
                </span>
            )}
        </routerContext.Consumer>
    );
});

Link.propTypes = {
    onClick: PropTypes.func,
    children: PropTypes.any,
    target: PropTypes.string.isRequired
};

/**
 * App routes.
 * IDs are `locale.pages[id]` keys and are also used to identify pages elsewhere.
 */
export const ROUTES = [
    {
        id: 'general',
        contents: [
            {
                id: 'home',
                icon: <HomeIcon />,
                url: '/'
            },
            {
                id: 'members',
                icon: <AssignmentIndIcon />,
                url: '/membroj'
            },
            {
                id: 'magazines',
                icon: <LibraryBooksIcon />,
                url: '/revuoj'
            },
            {
                id: 'statistics',
                icon: <AssessmentIcon />,
                url: '/statistiko'
            },
            {
                id: 'congresses',
                icon: <GroupIcon />,
                url: '/kongresoj'
            },
            {
                id: 'payments',
                icon: <PaymentIcon />,
                url: '/pagoj'
            },
            {
                id: 'elections',
                icon: <HowToVoteIcon />,
                url: '/vochdonado'
            }
        ]
    },
    {
        id: 'uea',
        contents: [
            {
                id: 'uea',
                icon: <span>?</span>,
                url: '/todo'
            }
        ]
    },
    {
        id: 'tejo',
        contents: [
            {
                id: 'tejo',
                icon: <span>?</span>,
                url: '/todo'
            }
        ]
    }
];
