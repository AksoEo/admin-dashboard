import React from 'react';
import SearchInput from './search-input';
import locale from '../../locale';
import './style';

/** @jsx React.createElement */

export default class MembersPage extends React.PureComponent {
    state = {
        searchQuery: []
    };

    render () {
        return (
            <div className="app-page members-page">
                <SearchInput
                    value={this.state.searchQuery}
                    onChange={searchQuery => this.setState({ searchQuery })}
                    placeholder={locale.members.search} />
            </div>
        );
    }
}
