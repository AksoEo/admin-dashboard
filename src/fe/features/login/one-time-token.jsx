import { h } from 'preact';
import { useContext, useEffect, useRef, useState } from 'preact/compat';
import { CircularProgress } from 'yamdl';
import TaskButton from '../../components/controls/task-button';
import { coreContext } from '../../core/connection';
import { oneTimeToken as locale } from '../../locale';
import DisplayError from '../../components/utils/error';
import './one-time-token.less';

const CONTEXTS = {
    delete_email_address: DeleteEmailAddress,
    unsubscribe_newsletter: UnsubscribeNewsletter,
};

export default function OneTimeToken ({ context, token }) {
    context = context.toLowerCase();
    const [loading, error, data] = useTokenData(context, token);
    const [done, setDone] = useState(false);
    const core = useContext(coreContext);
    const confirm = () => {
        return core.createTask('login/submitOneTimeToken', {
            ctx: context,
            token,
        }).runOnceAndDrop().then(() => {
            setDone(true);
        });
    };

    let content;

    if (loading) {
        content = (
            <div class="contents-loading">
                <CircularProgress indeterminate />
            </div>
        );
    } else if (error) {
        content = <DisplayError error={error} />;
    } else if (CONTEXTS[context]) {
        const Component = CONTEXTS[context];
        content = <Component data={data} confirm={confirm} done={done} />;
    } else {
        content = (
            <div>
                {locale.unknownContext}
            </div>
        );
    }

    return (
        <div class="login-one-time-token">
            {content}
        </div>
    );
}

function useTokenData (ctx, token) {
    const core = useContext(coreContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const loadKey = useRef(0);
    useEffect(() => {
        const key = ++loadKey.current;

        setLoading(true);
        core.createTask('login/getOneTimeToken', { ctx, token }).runOnceAndDrop().then(res => {
            if (key !== loadKey.current) return;
            setData(res);
        }).catch(err => {
            if (key !== loadKey.current) return;
            setError(err);
        }).finally(() => {
            if (key !== loadKey.current) return;
            setLoading(false);
        });
    }, [token]);

    return [loading, error, data];
}

function DeleteEmailAddress ({ confirm, done }) {
    if (done) {
        return (
            <div class="ott-context">
                {locale.deleteEmailAddress.confirmed}
            </div>
        );
    }

    return (
        <div class="ott-context">
            <h1>{locale.deleteEmailAddress.title}</h1>
            <p>{locale.deleteEmailAddress.description}</p>
            <TaskButton run={confirm}>
                {locale.deleteEmailAddress.confirm}
            </TaskButton>
        </div>
    );
}

function UnsubscribeNewsletter ({ confirm, done }) {
    if (done) {
        return (
            <div class="ott-context">
                {locale.unsubscribeNewsletter.confirmed}
            </div>
        );
    }

    return (
        <div class="ott-context">
            <h1>{locale.unsubscribeNewsletter.title}</h1>
            <p>{locale.unsubscribeNewsletter.description}</p>
            <TaskButton run={confirm}>
                {locale.unsubscribeNewsletter.confirm}
            </TaskButton>
        </div>
    );
}
