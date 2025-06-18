import React, { useCallback, useEffect, useState } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import AfiliacionesPorEmpresaDetalleTable from "./AfiliacionesPorEmpresaDetalleTable";

const selectionDef = {
  action: "",
  request: "",
  index: null,
  record: null,
  edit: null,
  errors: null,
};

const useAfiliacionesPorEmpresaDetalle = () => {
  //#region Trato queries a APIs
  const pushQuery = useQueryQueue((action, params) => {
	console.log("useDocumentaciones_action", action, " & ", params);
	switch (action) {
	  case "GetTipoList": {
		return {
		  config: {
			baseURL: "Comunes",
			endpoint: `/RefTipoDocumentacion/GetAll`,
			method: "GET",
		  },
		};
	  }
	 
	  default:
		return null;
	}
  });
  //#endregion

  //#region declaracion y carga list tipos documentacion
  const [tipoDocumentacionList, setTipoDocumentacionList] = useState({
	loading: "Cargando..",
	data: [],
	error: {},
  });
  useEffect(() => {
	if (!tipoDocumentacionList.loading) return;
	pushQuery({
	  action: "GetTipoList",
	  onOk: async (res) => setTipoDocumentacionList({ data: res }),
	  onError: async (err) => {
		const newList = { data: [] };
		if (err.code !== 404) newList.error = err;
		setTipoDocumentacionList(newList);
	  },
	});
  }, [pushQuery, tipoDocumentacionList.loading]);
  //#endregion

  //#region declaracion y carga list y selected
  const [list, setList] = useState({
	loading: null,
	params: {},
	data: [],
	error: null,
	selection: { ...selectionDef },
  });

  useEffect(() => {
	if (!list.loading) return;
	pushQuery({
	  action: "GetList",
	  params: { ...list.params },
	  onOk: async (data) =>
		setList((o) => {
		  const selection = {
			...selectionDef,
			record:
			  data.find((r) => r.id === o.selection.record?.id) ?? data.at(0),
		  };
		  if (selection.record)
			selection.index = data.indexOf(selection.record);
		  return {
			...o,
			loading: null,
			data,
			error: null,
			selection,
		  };
		}),
	  onError: async (err) =>
		setList((o) => ({
		  ...o,
		  loading: null,
		  data: [],
		  error: err.code === 404 ? null : err,
		  selection: { ...selectionDef },
		})),
	});
  }, [pushQuery, list.loading, list.params]);
  //#endregion

  const requestChanges = useCallback((type, payload = {}) => {
	switch (type) {
	  case "selected": {
		return setList((o) => ({
		  ...o,
		  selection: {
			...o.selection,
			request: payload.request,
			action: payload.action,
			edit: {
			  ...(payload.request === "A" ? {} : o.selection.record),
			  ...payload.record,
			},
		  },
		}));
	  }
	  case "list": {
		if (payload.clear)
		  return setList((o) => ({
			...o,
			loading: null,
			data: [],
			error: null,
			selection: { ...selectionDef },
		  }));
		return setList((o) => ({
		  ...o,
		  loading: "Cargando...",
		  params: { ...payload.params },
		  data: [],
		}));
	  }
	  default:
		return;
	}
  }, []);


  const render = () => (
	<>
	  <AfiliacionesPorEmpresaDetalleTable
		tipoList={tipoDocumentacionList.data}
		data={list.data}
		loading={!!list.loading}
		noDataIndication={
		  list.loading ?? list.error?.message ?? "No existen datos para mostrar"
		}
		selection={{
		  selected: [list.selection.record?.id].filter((r) => r),
		  onSelect: (record, isSelect, index, e) =>
			setList((o) => ({
			  ...o,
			  selection: {
				...selectionDef,
				index,
				record,
			  },
			})),
		}}
	  />
	</>
  );

  return [render, requestChanges, list.selection.record];
};

export default useAfiliacionesPorEmpresaDetalle;
