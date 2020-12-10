import React from 'react';
import {
  GoogleMap, LoadScript, Marker, InfoWindow
} from '@react-google-maps/api';
import AntSwitch from '@material-ui/core/Switch';

const containerStyle = {
  width: '100%',
  height: '450px'
};

const infoDivStyle = {
  background: '#fff',
  borderRadius: '50%'
};

const center = {
  lat: 32.312924,
  lng: 35.04662
};

function MyMap({ loadslist, handleLoadClicked }) {
  const [map, setMap] = React.useState(null);
  const [loads, setLoads] = React.useState([]);

  React.useEffect(() => {
    setLoads(loadslist);
  }, [loadslist]);

  const getCircle = (magnitude, isOn) => {
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: (isOn) ? 'green' : 'red',
      fillOpacity: 1,
      scale: Math.pow(2, magnitude) / 2,
      strokeColor: 'white',
      strokeWeight: 0.5,
    };
  };

  const onLoad = React.useCallback((map) => {

    map.setOptions({
      zoom: 11.5,
      center: {
        lat: 32.372924,
        lng: 35.108662
      },
      disableDefaultUI: true,
      mapTypeControl: false,
      mapZoomControl: false,
      navigationControl: false,
      optimized: false,
      styles: [{ featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e9e9e9' }, { lightness: 17 }] }, { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }, { lightness: 20 }] }, { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }, { lightness: 17 }] }, { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#ffffff' }, { lightness: 29 }, { weight: 0.2 }] }, { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#ffffff' }, { lightness: 18 }] }, { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#ffffff' }, { lightness: 16 }] }, { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }, { lightness: 21 }] }, { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#dedede' }, { lightness: 21 }] }, { elementType: 'labels.text.stroke', stylers: [{ visibility: 'on' }, { color: '#ffffff' }, { lightness: 16 }] }, { elementType: 'labels.text.fill', stylers: [{ saturation: 36 }, { color: '#333333' }, { lightness: 40 }] }, { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] }, { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#f2f2f2' }, { lightness: 19 }] }, { featureType: 'administrative', elementType: 'geometry.fill', stylers: [{ color: '#fefefe' }, { lightness: 20 }] }, { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#fefefe' }, { lightness: 17 }, { weight: 1.2 }] }],
    });

    /*    for (let i = 0; i < loads.length; i++) {
      const item = loads[i];
      const marker = new window.google.maps.Marker({
        position: { lat: item[1], lng: item[2] },
        map,
        icon: getCircle(item[4] / 3, item[3]),
        label: {
          text: ' ',
          color: '#000',
          fontSize: `${item[4] + 5}px`,
          border: '1px solid #f00'
        }
      });
      const information = new window.google.maps.InfoWindow({
        content: `<h4>${item[0]}</h4><h5>Total Power : ${item[4]} kw</h5><h5>Status : ${(item[3]) ? 'UP' : 'DOWN'}</h5>`
      });
      marker.addListener('click', () => {
        handleLoadClicked(i);
      });
      marker.addListener('mouseover', () => {
        information.open(map, marker);
      });
      marker.addListener('mouseout', () => {
        information.close();
      });
    } */

    setMap(map);
  }, [loads]);

  const onUnmount = React.useCallback((map) => {
    setMap(null);
  }, [loads]);

  const [selected, setSelected] = React.useState({});

  const onSelect = (item) => {
    setSelected(item);
  };

  const renderMap = () => {
    return (
      <LoadScript
        googleMapsApiKey="AIzaSyAYjt0AdvUUE0ngK_dz8Uw0Ys9Qy6J6omo"
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={3}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {
            Object.keys(loads).map((item, index) => {
              return (
                <Marker
                  key={loads[item].code + loads[item].name}
                  position={{ lat: loads[item].location.latitude, lng: loads[item].location.longitude }}
                  onLoad={() => onSelect(item)}
                  icon={(loads[item].status) ? '/static/images/icons/elec-on.png' : '/static/images/icons/elec-off.png'}
                >
                  <InfoWindow
                    position={{ lat: loads[item].location.latitude, lng: loads[item].location.longitude }}
                    clickable
                    onCloseClick={() => setSelected({})}

                  >
                    <div style={{ ...infoDivStyle }}>
                      <h4>
                        {loads[item].name}
                        {' '}
                        {' ('}
                        {(parseFloat(loads[item].latestPowerReading) > 0) ? parseFloat(loads[item].latestPowerReading).toFixed(1) : loads[item].nominalPower}
                        {' '}
                        MW
                        {') '}
                        <AntSwitch checked={loads[item].status} name="checkedC" color="primary" onChange={() => handleLoadClicked(item)} />
                      </h4>
                    </div>
                  </InfoWindow>

                </Marker>
              );
            })
          }
        </GoogleMap>
      </LoadScript>
    );
  };

  return (
    <div>
      {Object.keys(loads).length > 0 && (
        <h1>{renderMap()}</h1>
      )}
    </div>
  );
}

export default MyMap;
