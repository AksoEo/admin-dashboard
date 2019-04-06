import React from 'react';
import SearchInput from './search-input';
import MembersList, {
    FieldPicker, AVAILABLE_FIELDS, SORTABLE_FIELDS, PERMANENT_FIELDS
} from './list';
import locale from '../../locale';
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
        let statsLine;

        if (this.state.submitted) {
            // TODO: use actual data
            const count = 123;
            const total = 456;
            const time = '789 µs';
            const filtered = this.state.search.predicates.filter(p => p.enabled).length;
            const text = locale.members.resultStats(count, filtered, total, time);
            statsLine = <div className="stats-line">{text}</div>;
        }

        return (
            <div className="app-page members-page">
                <SearchInput
                    value={this.state.search}
                    onChange={search => this.setState({ search })}
                    onSubmit={() => this.setState({ submitted: true })}
                    onUnsubmit={() => this.setState({ submitted: false })} />
                <FieldPicker
                    open={this.state.fieldPickerOpen}
                    available={AVAILABLE_FIELDS}
                    sortables={SORTABLE_FIELDS}
                    permanent={PERMANENT_FIELDS}
                    selected={this.state.fields}
                    onChange={fields => this.setState({ fields })}
                    onClose={() => this.setState({ fieldPickerOpen: false })} />
                {statsLine}
                {this.state.submitted && (
                    <MembersList
                        fields={this.state.fields}
                        onFieldsChange={fields => this.setState({ fields })}
                        onEditFields={() => this.setState({ fieldPickerOpen: true })} />
                )}
            </div>
        );
    }
}
