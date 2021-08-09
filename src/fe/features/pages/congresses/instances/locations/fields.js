import { h } from 'preact';
import { useState, PureComponent } from 'preact/compat';
import { Button, Dialog, Slider, TextField } from 'yamdl';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import Brightness1Icon from '@material-ui/icons/Brightness1';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import StarIcon from '@material-ui/icons/Star';
import StarOutlineIcon from '@material-ui/icons/StarBorder';
import DirectionsBusIcon from '@material-ui/icons/DirectionsBus';
import TrainIcon from '@material-ui/icons/Train';
import LocalAirportIcon from '@material-ui/icons/LocalAirport';
import LocalTaxiIcon from '@material-ui/icons/LocalTaxi';
import SubwayIcon from '@material-ui/icons/Subway';
import TramIcon from '@material-ui/icons/Tram';
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat';
import DirectionsBikeIcon from '@material-ui/icons/DirectionsBike';
import LocalParkingIcon from '@material-ui/icons/LocalParking';
import LocalGasStationIcon from '@material-ui/icons/LocalGasStation';
import AtmIcon from '@material-ui/icons/Atm';
import LocalHospitalIcon from '@material-ui/icons/LocalHospital';
import LocalPharmacyIcon from '@material-ui/icons/LocalPharmacy';
import LocalPrintshopIcon from '@material-ui/icons/LocalPrintshop';
import LocalMallIcon from '@material-ui/icons/LocalMall';
import LocalLaundryServiceIcon from '@material-ui/icons/LocalLaundryService';
import LocalPostOfficeIcon from '@material-ui/icons/LocalPostOffice';
import InfoIcon from '@material-ui/icons/Info';
import RestaurantIcon from '@material-ui/icons/Restaurant';
import FastfoodIcon from '@material-ui/icons/Fastfood';
import LocalCafeIcon from '@material-ui/icons/LocalCafe';
import LocalBarIcon from '@material-ui/icons/LocalBar';
import LocalGroceryStoreIcon from '@material-ui/icons/LocalGroceryStore';
import LocalConvenienceStoreIcon from '@material-ui/icons/LocalConvenienceStore';
import StoreIcon from '@material-ui/icons/Store';
import MuseumIcon from '@material-ui/icons/Museum';
import LocalMoviesIcon from '@material-ui/icons/LocalMovies';
import LocalPlayIcon from '@material-ui/icons/LocalPlay';
import CenterFocusStrongIcon from '@material-ui/icons/CenterFocusStrong';
import LocalLibraryIcon from '@material-ui/icons/LocalLibrary';
import ExploreIcon from '@material-ui/icons/Explore';
import LocalHotelIcon from '@material-ui/icons/LocalHotel';
import SingleBedIcon from '@material-ui/icons/SingleBed';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CheckIcon from '@material-ui/icons/Check';
import TextArea from '../../../../../components/text-area';
import MdField from '../../../../../components/md-field';
import SvgIcon from '../../../../../components/svg-icon';
import LimitedTextField from '../../../../../components/limited-text-field';
import { layoutContext } from '../../../../../components/dynamic-height-div';
import { date, time } from '../../../../../components/data';
import { Validator } from '../../../../../components/form';
import { connect } from '../../../../../core/connection';
import { congressLocations as locale } from '../../../../../locale';
import LatLonEditor from '../../ll-editor';
import './fields.less';

const ICON_LUT = {
    GENERIC: Brightness1Icon,
    STAR: StarIcon,
    BUS: DirectionsBusIcon,
    TRAIN: TrainIcon,
    AIRPORT: LocalAirportIcon,
    TAXI: LocalTaxiIcon,
    METRO: SubwayIcon,
    TRAM: TramIcon,
    FERRY: DirectionsBoatIcon,
    BIKE_RENTAL: DirectionsBikeIcon,
    PARKING: LocalParkingIcon,
    GAS_STATION: LocalGasStationIcon,
    ATM: AtmIcon,
    HOSPITAL: LocalHospitalIcon,
    PHARMACY: LocalPharmacyIcon,
    PRINT_SHOP: LocalPrintshopIcon,
    MALL: LocalMallIcon,
    LAUNDRY_SERVICE: LocalLaundryServiceIcon,
    POST_OFFICE: LocalPostOfficeIcon,
    TOURIST_INFORMATION: InfoIcon,
    POLICE: props => (
        <SvgIcon {...props}>
            <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm2.5 11.59l.9 3.88-3.4-2.05-3.4 2.05.9-3.87-3-2.59 3.96-.34L12 6.02l1.54 3.64 3.96.34-3 2.59z" />
        </SvgIcon>
    ),
    RESTAURANT: RestaurantIcon,
    FAST_FOOD: FastfoodIcon,
    CAFE: LocalCafeIcon,
    BAR: LocalBarIcon,
    GROCERY_STORE: LocalGroceryStoreIcon,
    CONVENIENCE_STORE: LocalConvenienceStoreIcon,
    STORE: StoreIcon,
    MUSEUM: MuseumIcon,
    MOVIE_THEATER: LocalMoviesIcon,
    THEATER: LocalPlayIcon,
    CULTURAL_CENTER: CenterFocusStrongIcon,
    LIBRARY: LocalLibraryIcon,
    POINT_OF_INTEREST: ExploreIcon,
    HOTEL: LocalHotelIcon,
    HOSTEL: SingleBedIcon,
};

export const FIELDS = {
    type: {
        component ({ value }) {
            return locale.fields.types[value];
        },
    },
    icon: {
        slot: 'icon',
        component ({ value, editing, onChange, slot }) {
            if (editing) {
                return <IconPicker value={value} onChange={onChange} />;
            }

            const Icon = ICON_LUT[value];
            if (!Icon) return <span class="congress-location-icon is-empty" data-slot={slot} />;
            return (
                <span class="congress-location-icon" data-slot={slot}>
                    <Icon style={{ verticalAlign: 'middle' }} />
                </span>
            );
        },
    },
    name: {
        slot: 'title',
        component ({ value, editing, onChange }) {
            if (editing) {
                return <Validator
                    outline
                    label={locale.fields.name}
                    component={LimitedTextField}
                    maxLength={50}
                    validate={value => {
                        if (!value) throw { error: locale.fields.nameRequired };
                    }}
                    value={value}
                    onChange={e => onChange(e.target.value)} />;
            }
            return <span class="congress-location-name">{value}</span>;
        },
    },
    description: {
        skipLabel: true,
        component ({ value, editing, onChange, slot }) {
            if (!editing && !value) return null;
            return <MdField
                class="congress-location-description"
                value={value}
                maxLength={200}
                editing={editing}
                onChange={value => onChange(value || null)}
                inline={slot === 'body'}
                data-slot={slot}
                rules={['emphasis', 'strikethrough', 'link', 'list', 'table']} />;
        },
    },
    address: {
        component ({ value, editing, onChange }) {
            if (editing) {
                return <TextArea value={value} onChange={onChange} maxLength={500} />;
            }
            if (!value) return null;
            return (
                <div class="congress-location-address">
                    {('' + value).split('\n').map((l, i) => <div key={i}>{l}</div>)}
                </div>
            );
        },
    },
    ll: {
        component ({ value, editing, onChange }) {
            return <LatLonEditor value={value} editing={editing} onChange={onChange} />;
        },
    },
    rating: {
        component ({ value, editing, onChange }) {
            const [virtualType, setVirtualType] = useState('stars');
            const [virtualMax, setVirtualMax] = useState(5);

            let type, rating, max;
            if (value && Number.isFinite(value.rating)) {
                type = value.type;
                rating = value.rating;
                max = value.max;
            } else {
                type = virtualType;
                rating = NaN;
                max = virtualMax;
                // if the server sends a bogus object (value.rating is not finite) then we need to
                // pretend we don't have a value
                value = null;
            }

            if (!value && !editing) return;

            // blendMin and blendMax are the left and right edges of the filled icon size. because
            // the icons are inset a bit and not actually 24px wide, e.g. 0.9 would appear as
            // completely filled otherwise.
            let Icon, EmptyIcon, blendMin, blendMax;
            if (type === 'hearts') {
                Icon = FavoriteIcon;
                EmptyIcon = FavoriteBorderIcon;
                blendMin = 3 / 24;
                blendMax = 21 / 24;
            } else {
                Icon = StarIcon;
                EmptyIcon = StarOutlineIcon;
                blendMin = 7 / 24;
                blendMax = 17 / 24;
            }

            const setRatingOnClick = index => () => {
                onChange({ ...value, rating: index + 1 });
            };

            const items = [];
            let editor;
            for (let i = 0; i < max; i++) {
                const index = i;
                const isFilled = i < Math.floor(rating);
                const isEmpty = i >= rating;
                const blend = (blendMax - blendMin) * (rating - Math.floor(rating)) + blendMin;

                items.push(
                    <span
                        class="rating-cell"
                        data-type={type}
                        data-null={!value}
                        onClick={setRatingOnClick(index)}
                        key={i}>
                        {isFilled ? <Icon /> : isEmpty ? <EmptyIcon /> : (
                            <span class="rating-cell-blend">
                                <span class="blend-top" style={{ width: `${blend * 100}%` }}>
                                    <Icon />
                                </span>
                                <EmptyIcon />
                            </span>
                        )}
                    </span>
                );
            }
            if (editing) {
                editor = (
                    <span class="rating-editor">
                        <Validator
                            component={TextField}
                            validate={value => {
                                if (Number.isNaN(rating)) return;
                                if (!Number.isFinite(value)) throw { error: locale.fields.ratingInvalid };
                                if (value < 0 || value > max) throw { error: locale.fields.ratingInvalid };
                            }}
                            outline
                            type="number"
                            min="0"
                            max={max}
                            step="0.1"
                            value={rating}
                            onChange={e => e.target.value
                                ? onChange({ type, rating: +e.target.value, max })
                                : onChange(null)} />
                        <span class="editor-infix">{locale.fields.ratingInfixOf}</span>
                        <Validator
                            component={TextField}
                            validate={value => {
                                if (!Number.isFinite(+value) || value < 1 || value > 10) {
                                    throw { error: locale.fields.ratingInvalid };
                                }
                            }}
                            outline
                            type="number"
                            min="1"
                            max="10"
                            step="1"
                            value={max}
                            trailing={(
                                <Button icon small onClick={() => {
                                    const newType = type === 'stars' ? 'hearts' : 'stars';
                                    if (!value) setVirtualType(newType);
                                    else onChange({ type: newType, rating, max });
                                }}>
                                    <Icon style={{ verticalAlign: 'middle' }} />
                                </Button>
                            )}
                            onChange={e => {
                                if (!value) setVirtualMax(+e.target.value);
                                else onChange({ type, rating, max: +e.target.value });
                            }} />
                    </span>
                );
            } else {
                items.push(
                    <span class="rating-numeric">
                        {(+rating).toLocaleString('fr-FR', { maximumFractionDigits: 1 })}
                    </span>
                );
            }
            return (
                <span class="congress-location-rating">
                    <span class="inner-rating">
                        {items}
                    </span>
                    {editor}
                </span>
            );
        },
    },
    openHours: {
        component (props) {
            return <OpenHoursField {...props} />;
        },
    },
    externalLoc: {
        component () {
            throw new Error('illegal invocation');
        },
    },
};

const portalContainer = document.createElement('div');
portalContainer.id = 'congress-location-icon-picker-portal-container';
document.body.appendChild(portalContainer);

function orderPortalContainerFront () {
    document.body.removeChild(portalContainer);
    document.body.appendChild(portalContainer);
}

function IconPicker ({ value, onChange }) {
    const [open, setOpen] = useState(false);

    const CurrentIcon = ICON_LUT[value];

    return (
        <Button class="congress-location-icon-picker" onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            setOpen(true);
            orderPortalContainerFront();
        }}>
            {value ? (
                <span class="picker-preview">
                    <CurrentIcon style={{ verticalAlign: 'middle' }} />
                    {' '}
                    {locale.iconPicker.labels[value]}
                </span>
            ) : (
                <span class="picker-preview no-icon">
                    {locale.iconPicker.empty}
                </span>
            )}
            <div class="expand-icon">
                <ExpandMoreIcon style={{ verticalAlign: 'middle' }} />
            </div>

            <Dialog
                class="congress-location-icon-picker-dialog"
                container={portalContainer}
                backdrop
                title={locale.iconPicker.pick}
                open={open}
                onClose={() => setOpen(false)}>
                {Object.keys(ICON_LUT).map(id => {
                    const Icon = ICON_LUT[id];
                    return (
                        <Button
                            key={id}
                            class={'picker-item' + ((id === value) ? ' is-selected' : '')}
                            onClick={() => {
                                onChange(id);
                                setOpen(false);
                            }}>
                            <div class="picker-label">
                                <Icon style={{ verticalAlign: 'middle' }} />
                                {' '}
                                {locale.iconPicker.labels[id]}
                            </div>
                            <div class="picker-check">
                                <CheckIcon />
                            </div>
                        </Button>
                    );
                })}
            </Dialog>
        </Button>
    );
}

function* enumerateDateRange (dateFrom, dateTo) {
    if (!dateFrom || !dateTo) return;
    let date = new Date(dateFrom);
    const endDate = new Date(dateTo);
    while (date < endDate) {
        yield date.toISOString().split('T')[0]; // yield the date part
        date = new Date(+date + 86400 * 1000);
    }
    yield endDate.toISOString().split('T')[0];
}
// this is a silly hack because of the way for..of works
function dateRange (dateFrom, dateTo) {
    return { [Symbol.iterator]: () => enumerateDateRange(dateFrom, dateTo) };
}

const OpenHoursField = connect(({ userData }) => (
    ['congresses/instance', { congress: userData.congress, id: userData.instance }]
))(data => ({
    dateFrom: data ? data.dateFrom : null,
    dateTo: data ? data.dateTo : null,
}))(class OpenHoursField extends PureComponent {
    static contextType = layoutContext;

    componentDidUpdate (prevProps) {
        if (prevProps.dateFrom !== this.props.dateFrom || prevProps.dateTo !== this.props.dateTo) {
            this.context && this.context();
        }
    }

    render ({ value, editing, onChange, dateFrom, dateTo }) {
        if (!editing && !value) return null;
        const items = [];
        for (const date of dateRange(dateFrom, dateTo)) {
            items.push(
                <OpenHoursDay
                    key={date}
                    date={date}
                    value={value && value[date] || []}
                    onChange={day => {
                        const newValue = value ? { ...value } :  {};
                        if (!day.length) delete newValue[date];
                        else newValue[date] = day;
                        if (Object.keys(newValue).length) onChange(newValue);
                        else onChange(null);
                    }}
                    editing={editing} />
            );
        }

        return (
            <div class="congress-location-open-hours">
                {items}
            </div>
        );
    }
});

function timeToSeconds (time) {
    const parts = time.split(':');
    return (+parts[0]) * 3600 + (+parts[1]) * 60;
}
function secondsToTime (secs) {
    secs = Math.max(0, Math.min(secs, 86400 - 1)); // can't be 24:00
    const pad2 = x => ('00' + x).substr(-2);
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    return pad2(hours) + ':' + pad2(mins);
}

function OpenHoursDay ({ date: pDate, value, editing, onChange }) {
    const endTime = 86400 - 60;
    let latestTime = 0;
    for (const range of value) {
        latestTime = Math.max(latestTime, timeToSeconds(range.split('-')[1]));
    }

    const addRange = (e) => {
        e.preventDefault();
        onChange(value.concat([secondsToTime(latestTime) + '-' + secondsToTime(endTime)]));
    };
    const onRangeChange = index => range => {
        const newValue = value.slice();
        newValue[index] = range;
        onChange(newValue);
    };
    const onRemoveRange = index => () => {
        const newValue = value.slice();
        newValue.splice(index, 1);
        onChange(newValue);
    };

    return (
        <div class={'open-hours-day' + (editing ? ' is-editing' : '') + (!value.length ? ' is-empty' : '')}>
            <span class="day-date">
                <date.renderer value={pDate} />
            </span>
            {value.map((range, i) => (
                <OpenHoursRange
                    key={i}
                    value={range}
                    editing={editing}
                    onChange={onRangeChange(i)}
                    onRemove={onRemoveRange(i)} />
            ))}
            {!editing && !value.length && locale.fields.openHoursClosed}
            {editing && (
                <div class="add-container">
                    <Button icon small onClick={addRange}>
                        <AddIcon />
                    </Button>
                </div>
            )}
        </div>
    );
}

function OpenHoursRange ({ value, editing, onChange, onRemove }) {
    const parts = value.split('-');
    const startSecs = timeToSeconds(parts[0]);
    const endSecs = timeToSeconds(parts[1]);

    const commit = (startSecs, endSecs) => {
        if (endSecs < startSecs) {
            // swap around to fix order
            const tmp = endSecs;
            endSecs = startSecs;
            startSecs = tmp;
        }
        onChange(secondsToTime(startSecs) + '-' + secondsToTime(endSecs));
    };

    if (editing) {
        return (
            <div class="open-hours-range is-editing">
                <Button class="remove-button" icon small onClick={e => {
                    e.preventDefault();
                    onRemove();
                }}>
                    <RemoveIcon />
                </Button>
                <time.editor
                    outline
                    value={startSecs}
                    onChange={secs => {
                        commit(secs, endSecs);
                    }} />
                <Slider
                    class="hours-slider"
                    value={[startSecs, endSecs]}
                    onChange={([a, b]) => {
                        commit(a, b);
                    }}
                    min={0}
                    max={86400 - 1} />
                <time.editor
                    outline
                    value={endSecs}
                    onChange={secs => {
                        commit(startSecs, secs);
                    }} />
            </div>
        );
    }

    return (
        <span class="open-hours-range">
            {secondsToTime(startSecs)}–{secondsToTime(endSecs)}
        </span>
    );
}
