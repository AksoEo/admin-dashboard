import { h } from 'preact';
import { Button } from '@cpsdqs/yamdl';
import PersonIcon from '@material-ui/icons/Person';
import PaymentIcon from '@material-ui/icons/Payment';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Page from '../../../components/page';
import { index as locale } from '../../../locale';
import './index.less';

export default class HomePage extends Page {
    render () {
        return (
            <div class="home-page">
                <div class="home-card">
                    <div class="hc-title">
                        {locale.tasks.title}
                    </div>
                    <div class="home-tasks">
                        <Button class="home-task">
                            <div class="task-icon">
                                <PersonIcon />
                            </div>
                            <div class="task-details">
                                <div class="task-title">
                                    actual data goes here
                                </div>
                            </div>
                            <div class="task-alt-icon">
                                <ChevronRightIcon />
                            </div>
                        </Button>
                        <Button class="home-task">
                            <div class="task-icon">
                                <PaymentIcon />
                            </div>
                            <div class="task-details">
                                <div class="task-title">
                                    Dave paid $999999 to TEJO
                                </div>
                                <span class="task-badge">
                                    disputed
                                </span>
                            </div>
                            <div class="task-alt-icon">
                                <ChevronRightIcon />
                            </div>
                        </Button>
                        <Button class="home-task">
                            <div class="task-icon">
                                <PersonIcon />
                            </div>
                            <div class="task-details">
                                <div class="task-title">
                                    jsmith requested changes
                                </div>
                            </div>
                            <div class="task-alt-icon">
                                <ChevronRightIcon />
                            </div>
                        </Button>
                    </div>
                </div>
                <div class="home-card">
                    <div class="hc-title">
                        other
                    </div>
                    <div>
                        <Button>
                            open tejo.org admin panel
                        </Button>
                        <Button>
                            open uea.org admin panel
                        </Button>
                    </div>
                </div>
                <div class="home-card">
                    <div class="hc-title">
                        statistics maybe
                    </div>
                    <div style={{ padding: '16px' }}>
                        <svg width="300" height="200">
                            <g fill="none" fillRule="evenodd">
                                <rect fill="#202020" width="300" height="200" rx="13"/>
                                <path d="M18 9.21l.872 1.55 6.75 12 .49.871-1.743.98-.49-.87L19 15.066V179h-2V15.067l-4.878 8.673-.49.872-1.744-.98.49-.872 6.75-12L18 9.21z" fill="#FFF" fillRule="nonzero"/>
                                <path d="M267.369 169.888l.871.49 12 6.75 1.55.872-1.55.872-12 6.75-.871.49-.98-1.743.87-.49 8.673-4.879H17v-2h258.932l-8.672-4.878-.872-.49.98-1.744z" fill="#FFF" fillRule="nonzero"/>
                                <text fontFamily="Roboto-Regular, Roboto" fontSize="16" fill="#FFF">
                                    <tspan x="133.195" y="193">time</tspan>
                                </text>
                                <text fontFamily="Roboto-Regular, Roboto" fontSize="16" fill="#FFF">
                                    <tspan x="29.223" y="27">amount of demo data</tspan>
                                </text>
                                <path d="M18.446 176.683c22.434-13.06 45.212-35.546 67.301-39.182 4.348-2.684 8.948-5.505 12.876-9.693 13.7-9.603 4.969-14.609 14.482-17.521 2.175-1.445 5.654 2.43 8.065 6.053 6.246 9.39 10.648 20.011 17.57 28.916 2.691 3.462 6.402 7.221 10.776 7.55 10.767.808 30.617-10.995 50.928-6.735 4.528.95 9.232 6.77 13.179 4.355 12.063-7.382 19.46-20.532 29.513-30.478 1.7-1.681 3.592-3.223 5.697-4.355 1.506-.809 3.79-2.624 4.943-1.362 6.357 6.958-4.17 30.337-.586 41.296 3.58 10.944 25.793 1.034 31.164 11.497" stroke="#4EFF00" strokeWidth="2"/>
                            </g>
                        </svg>
                    </div>
                </div>
                <div class="home-card">
                    <div class="hc-title">
                        additional info
                    </div>
                    <div style={{ padding: '16px' }}>
                        for help, contact your sysadmin at helpo@akso.org
                    </div>
                </div>
            </div>
        );
    }
}
