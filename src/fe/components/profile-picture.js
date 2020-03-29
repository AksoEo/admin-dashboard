import { h, Component } from 'preact';
import jdenticon from 'jdenticon';
import { base as apiHostBase } from 'akso:config';

// to avoid using the cardinal 1, 2, 3 ... identicons
const DECARDINALIFY = id => [
    `we don’t seem to have a profile picture for ${id} on file`,
    `${id} is now represented by a bunch of geometric shapes`,
    `this is the identicon hash for ${id}`,
    `${id} vershajne parolas Esperanton (auh estas organizo)`,
][id % 4];

/// Renders a member’s profile picture.
///
/// # Props
/// - `id`: member ID
/// - `self`: set to true to indicate that id is self
/// - `profilePictureHash`: if given, will load the profile picture; will show an identicon
///   otherwise
/// - `profilePictureURL`: optional override function that maps a codeholder id to the appropriate
///   path
export default class ProfilePicture extends Component {
    state = {
        srcSet: '',
        isIdenticon: false,
    };

    load () {
        const { id, self: isSelf, profilePictureHash } = this.props;
        if (!id) return;

        if (profilePictureHash) {
            const hash = Buffer.from(profilePictureHash).toString('base64');
            const fid = isSelf ? 'self' : id;
            const ppPath = this.props.profilePictureURL
                ? this.props.profilePictureURL(this.props.id)
                : `codeholders/${fid}/profile_picture/`;
            const urlBase = new URL(ppPath, apiHostBase).toString();
            const imgSrcSet = [32, 64, 128, 256].map(w => `${urlBase}${w}px?noop=${hash} ${w}w`).join(', ');
            this.setState({ imgSrcSet, isIdenticon: false });
        } else {
            const blobURL = URL.createObjectURL(new Blob([
                jdenticon.toSvg(DECARDINALIFY(id), 128),
            ], {
                type: 'image/svg+xml',
            }));
            this.setState({ imgSrcSet: `${blobURL} 128w`, isIdenticon: true });
        }
    }

    componentDidMount () {
        this.load();
    }

    componentDidUpdate (prevProps) {
        if (prevProps.id !== this.props.id
            || prevProps.profilePictureHash !== this.props.profilePictureHash) this.load();
    }

    render () {
        return (
            <img
                class={'profile-picture' + (this.state.isIdenticon ? ' is-identicon' : '')}
                srcSet={this.state.imgSrcSet} />
        );
    }
}
