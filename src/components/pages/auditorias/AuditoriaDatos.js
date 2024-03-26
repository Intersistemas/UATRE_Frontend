import React, { useEffect } from "react";
import Grid from "components/ui/Grid/Grid";
import Notebook from "components/ui/Notebook/Notebook";
import useAuditoriaDatos, { onLoadSelectKeepOrFirst } from "./useAuditoriaDatos";

const AuditoriaDatos = () => {
	const { render, request, selected } = useAuditoriaDatos({
		params: { sort: "-fechaHoraAuditoria" },
		onLoadSelect: onLoadSelectKeepOrFirst
	});

	useEffect(() => {
		request("list");
	}, [request]);

	return (
		<Grid col>
			<Grid col grow>
				{render()}
			</Grid>
			<Notebook width height="16em" pagination={{ size: 10 }}>
				{selected?.cambios?.split("\r\n").filter((r) => r)}
			</Notebook>
		</Grid>
	);
};

export default AuditoriaDatos;
