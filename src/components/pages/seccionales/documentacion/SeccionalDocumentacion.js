import { Grid } from "@mui/material";
import React, { useEffect, useState } from "react";
import DocumentacionList from "../../afiliados/documentacion/DocumentacionList";
import Button from "../../../ui/Button/Button";
import DocumentacionForm from "../../afiliados/documentacion/DocumentacionForm";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "../../../../redux/actions";

const SeccionalDocumentacion = () => {

const dispatch = useDispatch();

useEffect(()=>{
  //#region despachar Informar Modulo
  const moduloInfoDefault = {
    nombre: "SeccionalDocumentacion",
    acciones: [
      {
        id: 1,
        name: "Agrega Documentación",
        icon: "",
        disabled: false,
      },
      {
        id: 2,
        name: "Modifica Documentación",
        icon: "",
        disabled: false,
      },
      {
        id: 3,
        name: "Baja Documentación",
        icon: "",
        disabled: false,
      }
    ],
  };
  dispatch(handleModuloSeleccionar(moduloInfoDefault));
  //#endregion
},[])




  const [documentacionList, setDocumentacionList] = useState({
    data: [],
    idGen: 0,
  });
  const [documentacionItem, setDocumentacionItem] = useState({});

  return (
    <div>
      <Grid col full="width" gap="10px">
        <Grid full="width" gap="5px">
          <DocumentacionList
            config={{
              data: documentacionList.data,
              onSelect: (r) => {
                setDocumentacionItem({
                  data: { ...r },
                  hisotry: { ...r },
                  req: null,
                });
              },
            }}
          />
        </Grid>
        <Grid full="width" gap="5px">
          <Grid grow>
            <Button className="botonAmarillo" onClick={() => setDocumentacionItem({ data: {}, req: 1 })}>
              Agrega documentación
            </Button>
          </Grid>
          <Grid grow>
            <Button
              className="botonAmarillo"
              disabled={documentacionItem.req != null}
              onClick={() =>
                setDocumentacionItem((oldItem) => ({ ...oldItem, req: 2 }))
              }
            >
              Modifica documentación
            </Button>
          </Grid>
          <Grid grow>
            <Button
              className="botonAmarillo"
              disabled={documentacionItem.req != null}
              onClick={() =>
                setDocumentacionItem((oldItem) => ({ ...oldItem, req: 3 }))
              }
            >
              Borra documentación
            </Button>
          </Grid>
        </Grid>
        <Grid
          col
          full="width"
          gap="20px"
          style={{
            marginTop: "10px",
            border: "1px solid #186090",
            padding: "15px",
          }}
        >
          <DocumentacionForm
            config={{
              data: documentacionItem.data,
              disabled: documentacionItem.req == null,
              onChange: (dataChanges) =>
                setDocumentacionItem((oldValue) => ({
                  ...oldValue,
                  data: { ...oldValue.data, ...dataChanges },
                })),
              onCancel: () =>
                setDocumentacionItem((oldValue) => ({
                  data: oldValue.history,
                  history: oldValue.history,
                  req: null,
                })),
              onConfirm: () => {
                let data;
                let index = null;
                switch (documentacionItem.req) {
                  case 1: // Agrega
                    data = { ...documentacionItem.data, id: null };
                    index = documentacionList.data.length;
                    break;
                  case 2: // Modifica
                    data = { ...documentacionItem.data };
                    break;
                  case 3: // Borra
                    data = null;
                    break;
                  default:
                    return;
                }
                if (index == null) {
                  // Modifica o Borra
                  index = documentacionList.data.findIndex(
                    (r) => r.id === documentacionItem.data?.id
                  );
                }
                setDocumentacionList((oldValue) => {
                  const newValue = {
                    ...oldValue,
                    data: [...oldValue.data],
                  };
                  if (data == null) {
                    // Borra
                    newValue.data.splice(index, 1);
                  } else {
                    // Agrega o Modifica
                    if (data.id == null) {
                      // Agrega
                      newValue.idGen += 1;
                      data.id = newValue.idGen;
                    }
                    newValue.data.splice(index, 1, { ...data });
                  }
                  return newValue;
                });
                setDocumentacionItem({ req: null });
              },
            }}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default SeccionalDocumentacion;
