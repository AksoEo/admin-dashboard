import React from 'react';
import SearchInput from './search-input';
import MembersList, { FieldPicker, AVAILABLE_FIELDS, PERMANENT_FIELDS } from './list';
import './style';

/** The members’ page. */
export default class MembersPage extends React.PureComponent {
    state = {
        search: SearchInput.defaultValue(),
        fields: MembersList.defaultFields(),
        submitted: false,
        fieldPickerOpen: false
    };

    render () {
        return (
            <div className="app-page members-page">
                <SearchInput
                    value={this.state.search}
                    onChange={search => this.setState({ search })}
                    onSubmit={() => this.setState({ submitted: true })}
                    onUnsubmit={() => this.setState({ submitted: false })} />
                <button onClick={() => this.setState({ fieldPickerOpen: true })}>
                    temporary button to do the thing
                </button>
                <FieldPicker
                    open={this.state.fieldPickerOpen}
                    available={AVAILABLE_FIELDS}
                    permanent={PERMANENT_FIELDS}
                    selected={this.state.fields}
                    onChange={fields => this.setState({ fields })}
                    onClose={() => this.setState({ fieldPickerOpen: false })} />
                {this.state.submitted && (
                    <MembersList
                        fields={this.state.fields} />
                )}
            </div>
        );
    }
}
