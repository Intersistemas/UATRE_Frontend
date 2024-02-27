import React, { useState } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { mapOptions, seccionalesPines } from './seccionalesMapCfg';
import pinIcon from "media/map_IconTrigo.png"
import pinUATRE from "media/map_IconUatre.png"


import { Button } from 'react-bootstrap';
import "./seccionalesMap.css";
//import {Combobox, ComboboxInput, ComboboxPopover, ComboboxList, ComboboxOption} from "@reach/combobox"
import SeccionalesMapSearcher from './seccionalesMapSearcher';

const libraries = ['places'];
const mapContainerStyle = {
  width: '70vw',
  height: '70vh',
};
const center = {
  lat: -34.60048, // default latitude
  lng: -58.37274, // default longitude
};

const SeccionalesMap = () => {

  
  const [pan, setPan] = useState();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyAP-2UML3J9q5sQqJpUDFqJrTD4AxojvKg',
    libraries,
  });

  const [selectedMarker, setSelectedMarker] = useState("");
  if (loadError) {
    return <div>Error loading maps</div>;
  }
  if (!isLoaded) {
    return <div>Loading maps</div>;
  }
 
  const panTo = (value) =>{
    setPan(value);
  }

  return (
    <div>
      <SeccionalesMapSearcher panTo={panTo}/>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={pan ? 10 : 6}
        center={pan ? pan : center}
        options={{
          mapTypeControl: false,
          //disableDefaultUI: true,
          navigationControl: true
          
        }}
      >
        {seccionalesPines.map((pin) => {
            return (
              <div key={pin.nombre}>
                <Marker 
                  position={pin.loc}
                  options={{
                    icon:pinIcon,
                  }}
                  title={pin.nombre}
                  onClick={()=>{
                    setSelectedMarker(pin);
                  }}
                />
              </div>
            );
          })}
          <Marker position={center}  options={{
                    icon:pinUATRE,
                  }}/>
          {pan && <Marker position={pan}/> }

        {selectedMarker &&
          <InfoWindow
            position={selectedMarker.loc}
            options={{pixelOffset: new window.google.maps.Size(0, -40),
            }}
            onCloseClick={()=>setSelectedMarker("")}
          >
            <div>
              <h2>{selectedMarker.nombre}</h2>
              <Button className="botonAmarillo" onClick={()=> setSelectedMarker("")}>cierra</Button>
            </div>
          </InfoWindow>
        }
      </GoogleMap>
    </div>
  );
};


export default SeccionalesMap;