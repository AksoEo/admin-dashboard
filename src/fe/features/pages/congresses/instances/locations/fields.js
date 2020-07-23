import { h } from 'preact';
import Brightness1Icon from '@material-ui/icons/Brightness1';
import StarIcon from '@material-ui/icons/Star';
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
        component ({ value }) {
            return <span class="congress-location-name">{value}</span>;
        },
    },
    description: {
        slot: 'body',
        skipLabel: true,
        component ({ value, slot }) {
            return <div class="congress-location-description" data-slot={slot}>{value}</div>;
        },
    },
    address: {
        slot: 'body',
        component ({ value }) {
            return value;
        },
    },
};
