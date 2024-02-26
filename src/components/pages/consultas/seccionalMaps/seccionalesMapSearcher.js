import React from 'react';
import usePlacesAutocomplete, {getGeocode, getLatLng} from "use-places-autocomplete";
import { Autocomplete, TextField } from '@mui/material';
import { width } from '@mui/system';
import "./seccionalesMap.css";
import SearchSelectMaterialGMaps from 'components/ui/Select/SearchSelectMaterialGMaps';

const SeccionalesMapSearcher = (props) => {


    const {
        ready,
        value,
        setValue,
        suggestions: { status, data },
        cleanSuggestions,
      } = usePlacesAutocomplete({
            requestOptions:{
                location:{lat: () => 43.653225, lng: ()=> -79.353186},
                radius: 200 * 1000,
            },
        });

    const colocaPinYCentraliza = async (value) => {
            const results = await getGeocode({ address: value }).then(results => getLatLng(results[0]))
            props.panTo(results);
        }

  return (
    <div >

        <Autocomplete
            id="google-map-demo"
            sx={{ width: 300 }}
            getOptionLabel={(option) =>
                typeof option === 'string' ? option : option.description
            }
            filterOptions={(x) => x}
            options={data}
            autoComplete
            includeInputInList
            filterSelectedOptions
            value={value}
            noOptionsText="Sin Localidades"
            onChange={(event, value) => {
                colocaPinYCentraliza(value.description);
            }                
            }
            onInputChange={(event, newInputValue) => {
                setValue(newInputValue);
            }}
            renderInput={(params) => (
                <TextField {...params} label="Busca Localidad" fullWidth />
            )}
        />

    </div>
  )
}


export default SeccionalesMapSearcher;
