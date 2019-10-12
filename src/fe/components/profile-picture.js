import { h, Component } from 'preact';
import jdenticon from 'jdenticon';
import config from '../../config.val';

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
/// - `profilePictureHash`: if given, will load the profile picture; will show an identicon
///   otherwise
export default class ProfilePicture extends Component {
    state = {
        srcSet: '',
        isIdenticon: false,
    };

    load () {
        const { id, profilePictureHash } = this.props;
        if (!id) return;

        if (profilePictureHash) {
            const hash = Buffer.from(profilePictureHash).toString('base64');
            const urlBase = new URL(`codeholders/${id}/profile_picture/`, config.host).toString();
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
