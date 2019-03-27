import React from 'react';
import SearchInput from './search-input';
import MembersList from './list';
import './style';

/** The members’ page. */
export default class MembersPage extends React.PureComponent {
    state = {
        search: SearchInput.defaultValue(),
        fields: MembersList.defaultFields(),
        submitted: false
    };

    render () {
        return (
            <div className="app-page members-page">
                <SearchInput
                    value={this.state.search}
                    onChange={search => this.setState({ search })}
                    onSubmit={() => this.setState({ submitted: true })}
                    onUnsubmit={() => this.setState({ submitted: false })} />
                {this.state.submitted && (
                    <MembersList
                        fields={this.state.fields} />
                )}
            </div>
        );
    }
}
