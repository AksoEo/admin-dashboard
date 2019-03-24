import React from 'react';
import Button from '@material-ui/core/Button';
import SearchIcon from '@material-ui/icons/Search';
import PredicateEditor, { defaultFields } from './predicate-editor';
import locale from '../../locale';
import './style';

/** The members’ page. */
export default class MembersPage extends React.PureComponent {
    render () {
        return (
            <div className="app-page members-page">
                <MembersSearch />
            </div>
        );
    }
}

/** Members’ page search input. */
class MembersSearch extends React.PureComponent {
    state = {
        predicates: defaultFields(),
        expanded: false
    };

    toggleExpanded = () => {
        this.setState({ expanded: !this.state.expanded });
    };

    render () {
        return (
            <div className="members-search">
                <div className="search-contents">
                    <div className="search-title">{locale.members.search.title}</div>
                    <div className="search-box">
                        <div className="search-primary">
                            <div className="search-icon-container">
                                <SearchIcon />
                            </div>
                            <input
                                className="search-input"
                                placeholder={locale.members.search.placeholder} />
                        </div>
                        <PredicateEditor
                            value={this.state.predicates}
                            onChange={predicates => this.setState({ predicates })}
                            placeholder={locale.members.search.placeholder}
                            addPlaceholder={locale.members.search.addPredicate}
                            isOpen={this.state.expanded} />
                    </div>
                    <footer className="search-footer">
                        <Button className="search-expand" onClick={this.toggleExpanded}>
                            {this.state.expanded
                                ? locale.members.search.collapse
                                : locale.members.search.expand}
                        </Button>
                    </footer>
                </div>
            </div>
        );
    }
}
