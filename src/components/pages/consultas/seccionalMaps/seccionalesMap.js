import React, { useEffect, useState } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { mapOptions } from './seccionalesMapCfg';
import useQueryQueue, { QueryClass } from "components/hooks/useQueryQueue";
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
const center = {
  lat: -34.60048,
  lng: -58.37274,
};

const esEmailValido = (email) => {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  if (e === "" || e === "no tiene") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
};

const esDomicilioValido = (domicilio) => {
  if (!domicilio) return false;
  const d = domicilio.trim();
  return d !== "" && d !== "0";
};

const SeccionalesMap = () => {

  const [seccionales, setSeccionales] = useState([]);
  const [delegaciones, setDelegaciones] = useState([]);
  const [pan, setPan] = useState();
  const [valueRadio, setValueRadio] = React.useState('Todo');
  const [selectedMarker, setSelectedMarker] = useState("");

  const pushQuery = useQueryQueue((action) => {
    if (action === "GetSeccionales") {
      return {
        config: {
          baseURL: "Afiliaciones",
          endpoint: "/Seccional/GetSeccionalesSpecs",
          method: "POST",
        },
      };
    }
    if (action === "GetDelegaciones") {
      return {
        config: {
          baseURL: "Comunes",
          endpoint: "/RefDelegacion/GetAll",
          method: "GET",
        },
      };
    }
  });

  useEffect(() => {
    const fetchPage = (pageIndex) => {
      pushQuery(new QueryClass({
        action: "GetSeccionales",
        config: {
          body: { sort: "+codigo", soloActivos: false, pageIndex, pageSize: 50 },
        },
        onOk: ({ data, pages }) => {
          if (!Array.isArray(data)) return;
          const pins = data
            .filter((s) => s.latitud && s.longitud)
            .map((s) => ({
              nombre: s.provinciaDescripcion ? `${s.descripcion} - ${s.provinciaDescripcion}` : s.descripcion,
              loc: { lat: s.latitud, lng: s.longitud },
              domicilio: s.domicilio,
              email: s.email,
            }));
          setSeccionales((prev) => [...prev, ...pins]);
          if (pageIndex === 1) {
            for (let i = 2; i <= pages; i++) {
              fetchPage(i);
            }
          }
        },
      }));
    };
    fetchPage(1);

    pushQuery(new QueryClass({
      action: "GetDelegaciones",
      onOk: (data) => {
        if (!Array.isArray(data)) return;
        const pins = data
          .filter((d) => d.latitud && d.longitud)
          .map((d) => ({
            nombre: d.nombre,
            loc: { lat: d.latitud, lng: d.longitud },
            domicilio: d.domicilio,
            email: d.correo,
            celular: d.celular,
          }));
        setDelegaciones(pins);
      },
    }));
  }, [pushQuery]);

  const handleRadioChange = (event) => {
    setValueRadio(event.target.value);
  };

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
    libraries,
  });

  if (loadError) {
    return <div>Error loading maps</div>;
  }
  if (!isLoaded) {
    return <div>Loading maps</div>;
  }

  const panTo = (value) => {
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
        mapContainerClassName="map-container"
        zoom={pan ? 10 : 6}
        center={pan ? pan : center}
        options={{
          mapTypeControl: false,
          navigationControl: true,
        }}
      >
        {!(valueRadio === "Delegaciones") && seccionales.map((pin, index) => (
          <Marker
            key={`seccional-${index}`}
            position={pin.loc}
            options={{ icon: pinIcon }}
            title={pin.nombre}
            onClick={() => setSelectedMarker(pin)}
          />
        ))}

        {!(valueRadio === "Seccionales") && delegaciones.map((pin) => (
          <Marker
            key={`delegacion-${pin.nombre}`}
            position={pin.loc}
            options={{ icon: pinUATRE }}
            title={pin.nombre}
            onClick={() => setSelectedMarker(pin)}
          />
        ))}

        {pan && <Marker position={pan} />}

        {selectedMarker &&
          <InfoWindow
            position={selectedMarker.loc}
            options={{ pixelOffset: new window.google.maps.Size(0, -40) }}
            onCloseClick={() => setSelectedMarker("")}
          >
            <div className="info-window">
              <h2 className="info-window-title">
                {selectedMarker.nombre}{esDomicilioValido(selectedMarker.domicilio) ? ` - ${selectedMarker.domicilio}` : ''}
              </h2>

              <div className="info-window-grid">

                {selectedMarker.celular && <>
                  <strong className="info-window-label">Teléfono:</strong>
                  <span className="info-window-value">{selectedMarker.celular}</span>
                  <Button
                    size="lg"
                    className="botonAzul info-window-btn-action"
                    onClick={() => { window.location.href = `tel:${selectedMarker.celular}`; }}
                  >Llamar</Button>
                </>}

                {esEmailValido(selectedMarker.email) && <>
                  <strong className="info-window-label">Mail:</strong>
                  <span className="info-window-value">{selectedMarker.email}</span>
                  <Button
                    size="lg"
                    className="botonAzul info-window-btn-action"
                    onClick={() => { window.location.href = `mailto:${selectedMarker.email}`; }}
                  >Enviar Mail</Button>
                </>}

              </div>

              <Button
                size="lg"
                className="botonAmarillo info-window-btn-close"
                onClick={() => setSelectedMarker("")}
              >Cierra</Button>

            </div>
          </InfoWindow>
        }
      </GoogleMap>
    </div>
  );
};


export default SeccionalesMap;
