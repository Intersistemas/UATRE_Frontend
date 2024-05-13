import React, { useState } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { mapOptions, seccionalesPines, delegacionesPines } from './seccionalesMapCfg';
import pinIcon from "media/map_IconTrigo.png"
import pinUATRE from "media/map_IconUatre.png"
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import { Button } from 'react-bootstrap';
import "./seccionalesMap.css";
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

  const [valueRadio, setValueRadio] = React.useState('Todo');

  const handleRadioChange = (event) => {
    setValueRadio(event.target.value);
  };

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY,//'AIzaSyAP-2UML3J9q5sQqJpUDFqJrTD4AxojvKg',
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
      <div className='d-flex justify-content-between'>
      <SeccionalesMapSearcher panTo={panTo}/>
      <FormControl>
        <RadioGroup
          row
          aria-labelledby="demo-row-radio-buttons-group-label"
          name="row-radio-buttons-group"
          value={valueRadio}
          onChange={handleRadioChange}
        >
          <FormControlLabel value="Seccionales" control={<Radio />} label="Seccionales" />
          <FormControlLabel value="Delegaciones" control={<Radio />} label="Delegaciones" />
          <FormControlLabel value="Todo" control={<Radio />} label="Todo" />
        </RadioGroup>
      </FormControl>
      </div>
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
        {!(valueRadio === "Delegaciones") && seccionalesPines.map((pin) => {
            return (
              <div key={pin.nombre}>
                <Marker d
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

          {!(valueRadio === "Seccionales") && delegacionesPines.map((pin) => {
            return (
              <div key={pin.nombre}>
                <Marker 
                  position={pin.loc}
                  options={{
                    icon:pinUATRE,
                  }}
                  title={pin.nombre}
                  onClick={()=>{
                    setSelectedMarker(pin);
                  }}
                />
              </div>
            );
          })}
          {/*<Marker position={center}  options={{
                    icon:pinUATRE,
                  }}/>*/}
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
              <Button className="botonAzul" onClick={()=> setSelectedMarker("")}>Enviar Mail a UATRE</Button>
              <Button className="botonAmarillo" onClick={()=> setSelectedMarker("")}>cierra</Button>
            </div>
          </InfoWindow>
        }
      </GoogleMap>
    </div>
  );
};


export default SeccionalesMap;