import React from 'react';
import SearchInput from './search-input';
import './style';

/** The members’ page. */
export default class MembersPage extends React.PureComponent {
    render () {
        return (
            <div className="app-page members-page">
                <SearchInput />
            </div>
        );
    }
}
