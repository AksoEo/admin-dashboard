import { h } from 'preact';
import { useState } from 'preact/compat';
import { Button, TextField } from '@cpsdqs/yamdl';
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
import GavelIcon from '@material-ui/icons/Gavel';
import RestaurantIcon from '@material-ui/icons/Restaurant';
import FastfoodIcon from '@material-ui/icons/Fastfood';
import LocalCafeIcon from '@material-ui/icons/LocalCafe';
import LocalBarIcon from '@material-ui/icons/LocalBar';
import LocalGroceryStoreIcon from '@material-ui/icons/LocalGroceryStore';
import LocalConvenienceStoreIcon from '@material-ui/icons/LocalConvenienceStore';
import StoreIcon from '@material-ui/icons/Store';
import MuseumIcon from '@material-ui/icons/Museum';
import LocalMoviesIcon from '@material-ui/icons/LocalMovies';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import CenterFocusStrongIcon from '@material-ui/icons/CenterFocusStrong';
import LocalLibraryIcon from '@material-ui/icons/LocalLibrary';
import ExploreIcon from '@material-ui/icons/Explore';
import LocalHotelIcon from '@material-ui/icons/LocalHotel';
import TextArea from '../../../../../components/text-area';
import { Validator } from '../../../../../components/form';
import { congressLocations as locale } from '../../../../../locale';
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
    POLICE: GavelIcon,
    RESTAURANT: RestaurantIcon,
    FAST_FOOD: FastfoodIcon,
    CAFE: LocalCafeIcon,
    BAR: LocalBarIcon,
    GROCERY_STORE: LocalGroceryStoreIcon,
    CONVENIENCE_STORE: LocalConvenienceStoreIcon,
    STORE: StoreIcon,
    MUSEUM: MuseumIcon,
    MOVIE_THEATER: LocalMoviesIcon,
    THEATER: AccountBalanceIcon,
    CULTURAL_CENTER: CenterFocusStrongIcon,
    LIBRARY: LocalLibraryIcon,
    POINT_OF_INTEREST: ExploreIcon,
    HOTEL: LocalHotelIcon,
    HOSTEL: LocalHotelIcon,
};

export const FIELDS = {
    type: {
        component ({ value }) {
            return value;
        },
    },
    icon: {
        slot: 'icon',
        component ({ value }) {
            const Icon = ICON_LUT[value];
            if (!Icon) return <span class="congress-location-icon is-empty" />;
            return <span class="congress-location-icon"><Icon style={{ verticalAlign: 'middle' }} /></span>;
        },
    },
    name: {
        slot: 'title',
        component ({ value, editing, onChange }) {
            if (editing) {
                return <Validator
                    outline
                    label={locale.fields.name}
                    component={TextField}
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
            if (editing) {
                return <TextArea value={value} onChange={onChange} />;
            }
            return <div class="congress-location-description" data-slot={slot}>{value}</div>;
        },
    },
    address: {
        component ({ value, editing, onChange }) {
            if (editing) {
                return <TextArea value={value} onChange={onChange} />;
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
            if (editing) {
                const lat = value ? value[0] : 0;
                const lon = value ? value[1] : 0;
                return (
                    <span class="congress-location-ll is-editing">
                        <TextField
                            outline
                            label={locale.fields.llLat}
                            inputmode="numeric"
                            value={'' + lat}
                            onChange={e => e.target.value
                                ? onChange([+e.target.value, lon])
                                : onChange(null)} />
                        {' '}
                        <TextField
                            outline
                            label={locale.fields.llLon}
                            inputmode="numeric"
                            value={'' + lon}
                            onChange={e => e.target.value
                                ? onChange([lat, +e.target.value])
                                : onChange(null)} />
                    </span>
                );
            }
            if (!value) return null;
            return (
                <span class="congress-location-ll">
                    {locale.fields.llLat} {value[0]}{', '}
                    {locale.fields.llLon} {value[1]}
                </span>
            );
        },
    },
    rating: {
        component ({ value, editing, onChange }) {
            const [virtualType, setVirtualType] = useState('stars');
            const [virtualMax, setVirtualMax] = useState(5);
            if (!value && !editing) return;

            let type, rating, max;
            if (value) {
                type = value.type;
                rating = value.rating;
                max = value.max;
            } else {
                type = virtualType;
                rating = '';
                max = virtualMax;
            }

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
            const items = [];
            for (let i = 0; i < max; i++) {
                const isFilled = i < Math.floor(rating);
                const isEmpty = i >= rating;
                const blend = (blendMax - blendMin) * (rating - Math.floor(rating)) + blendMin;

                items.push(
                    <span class="rating-cell" data-type={type} data-null={!value} key={i}>
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
                items.push(
                    <span class="rating-editor">
                        <Validator
                            component={TextField}
                            validate={value => {
                                if (value === '') return;
                                if (!Number.isFinite(+value)) throw { error: locale.fields.ratingInvalid };
                                if (value < 0 || value > max) throw { error: locale.fields.ratingInvalid };
                            }}
                            outline
                            type="number"
                            min="0"
                            max={max}
                            step="0.1"
                            value={rating}
                            onChange={e => e.target.value
                                ? onChange({ type, rating: e.target.value, max })
                                : onChange(null)} />
                        {locale.fields.ratingInfixOf}
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
            return <span class="congress-location-rating">{items}</span>;
        },
    },
    externalLoc: {
        component ({ value }) {
            return value;
        },
    },
};
