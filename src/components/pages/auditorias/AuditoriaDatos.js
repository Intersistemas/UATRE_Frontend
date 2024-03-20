import React from "react";
import Grid from "components/ui/Grid/Grid";
import useQueryQueue from "components/hooks/useQueryQueue";

const AuditoriaDatos = () => {
	//#region API queries
	const pushQuery = useQueryQueue((action) => {
		switch (action) {
			case "GetList": {
				return {
					config: {}
				}
			}
			default:
				return null;
		}
	})
	//#endregion API queries

	return (
		<Grid col justify="center" grow>
			En desarrollo
		</Grid>
	);
};

export default AuditoriaDatos;
