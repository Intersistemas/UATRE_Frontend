import React, { useEffect } from "react";
import useCIIU from "./useCIIU";
import Lookup from "components/ui/Lookup/Lookup";
import Grid from "components/ui/Grid/Grid";

const onCloseDef = (selected = null) => {};

const CIIULookup = ({
	title = "Elige CIIU",
	data = [],
	onClose = onCloseDef,
}) => {
	onClose ??= onCloseDef;

	//#region mantenimiento de ciiu
	const {
		render: ciiuRender,
		request: ciiuRequest,
		selected: ciiuSelected,
	} = useCIIU({
		remote: data.length === 0,
		data,
		pagination: { size: 15 },
		mostrarBuscar: true,
		// columns: [{ dataField: "ciiu" }, { dataField: "descripcion" }],
	});
	useEffect(() => {
		ciiuRequest("list");
	}, [ciiuRequest]);
	//#endregion

	return (
		<Lookup
			title={title}
			onClose={onClose}
			table={{
				render: () => (
					<Grid full style={{ marginTop: "30px" }}>
						{ciiuRender()}
					</Grid>
				),
				getSelected: () => ciiuSelected,
			}}
		/>
	);
};

export default CIIULookup;
