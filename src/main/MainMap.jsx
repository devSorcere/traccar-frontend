import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import WhatsAppButtom from '../common/components/WhatsAppButtom';
import useFeatures from '../common/util/useFeatures';
import MapCurrentLocation from '../map/MapCurrentLocation';
import MapGeofence from '../map/MapGeofence';
import MapPadding from '../map/MapPadding';
import MapPositions from '../map/MapPositions';
import MapScale from '../map/MapScale';
import MapView from '../map/core/MapView';
import MapGeocoder from '../map/geocoder/MapGeocoder';
import MapAccuracy from '../map/main/MapAccuracy';
import MapDefaultCamera from '../map/main/MapDefaultCamera';
import MapLiveRoutes from '../map/main/MapLiveRoutes';
import MapSelectedDevice from '../map/main/MapSelectedDevice';
import PoiMap from '../map/main/PoiMap';
import MapNotification from '../map/notification/MapNotification';
import MapOverlay from '../map/overlay/MapOverlay';
import { devicesActions } from '../store';

const MainMap = ({ filteredPositions, selectedPosition, onEventsClick }) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  const eventsAvailable = useSelector((state) => !!state.events.items.length);

  const features = useFeatures();

  const onMarkerClick = useCallback((_, deviceId) => {
    dispatch(devicesActions.selectId(deviceId));
  }, [dispatch]);

  return (
    <>
      <MapView>
        <MapOverlay />
        <MapGeofence />
        <MapAccuracy positions={filteredPositions} />
        <MapLiveRoutes />
        <MapPositions
          positions={filteredPositions}
          onClick={onMarkerClick}
          selectedPosition={selectedPosition}
          showStatus
        />
        <MapDefaultCamera />
        <MapSelectedDevice />
        <PoiMap />
        <WhatsAppButtom />
      </MapView>
      {/* <MapScale />
      <MapCurrentLocation />
      <MapGeocoder />
      {!features.disableEvents && (
        <MapNotification enabled={eventsAvailable} onClick={onEventsClick} />
      )}
      {desktop && (
        <MapPadding left={parseInt(theme.dimensions.drawerWidthDesktop, 10)} />
      )} */}
    </>
  );
};

export default MainMap;
