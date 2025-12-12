import React from "react";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import Documentacion from "../../../documentacion/Documentacion";

const DenunciasFormDocumentaicon = ({
	data,
	readOnly,
	documentacionList,
	setDocumentacionList,
	setState,
	sendRequest,
	mapDocToPayload,
	setSelectedTab,
}) => {
	const entidadId = data?.id ?? 0;
	const entidadTipo = "R";

	return (
		<Grid full col gap="10px">
			<Documentacion
				data={documentacionList}
				tipoDocumentacion={[
					"Credencial",
					"Documento de Identidad",
					"Actas",
					"Documentos",
					"Recibos",
					"Fotos",
					"Otros",
				]}
				disabled={readOnly}
				onChange={({ index, item }) => {
					const prev = Array.isArray(documentacionList) ? documentacionList : [];

					// === ALTA (CREAR NUEVO ARCHIVO)
					if (index == null && item != null) {
						const temp = [...prev, { ...item }];
						setDocumentacionList(temp);
						setState((s) => ({
							...s,
							form: { ...s.form, documentacion: temp },
						}));

						// Persistencia diferida: se realiza luego vía persistirDocumentacion
						return;
					}

					// === BAJA
					if (index != null && item == null) {
						const current = prev[index];
						const id = current?.id;

						// Si no hay id, solo eliminar localmente
						if (!id) {
							const next = prev.filter((_, i) => i !== index);
							setDocumentacionList(next);
							setState((s) => ({
								...s,
								form: { ...s.form, documentacion: next },
							}));
							return;
						}

						// Actualización optimista
						const next = prev.filter((_, i) => i !== index);
						setDocumentacionList(next);
						setState((s) => ({
							...s,
							form: { ...s.form, documentacion: next },
						}));

						if (!entidadId) return;

						// Eliminar del servidor
						sendRequest(
							{
								baseURL: "Comunes",
								endpoint: `/DocumentacionEntidad/${id}`,
								method: "DELETE",
								errorType: "response",
							},
							() => {},
							(err) => {
								console.error(" Error al eliminar archivo:", err);
								// Rollback
								setDocumentacionList(prev);
								setState((s) => ({
									...s,
									form: { ...s.form, documentacion: prev },
								}));
							}
						);

						return;
					}

					// === MODIFICACIÓN (ACTUALIZAR ARCHIVO)
					if (index != null && item != null) {
						const current = prev[index] || {};
						const payload = mapDocToPayload(
							{ ...current, ...item },
							entidadId,
							entidadTipo
						);

						// Actualización optimista
						const next = [...prev];
						next.splice(index, 1, { ...current, ...item });
						setDocumentacionList(next);
						setState((s) => ({
							...s,
							form: { ...s.form, documentacion: next },
						}));

						if (!entidadId) return;

						// Actualizar en el servidor
						sendRequest(
							{
								baseURL: "Comunes",
								endpoint: `/DocumentacionEntidad/${payload.id}`,
								method: "PUT",
								body: payload,
								errorType: "response",
							},
							() => {},
							(err) => {
								console.error(" Error al actualizar archivo:", err);
								// Rollback
								setDocumentacionList(prev);
								setState((s) => ({
									...s,
									form: { ...s.form, documentacion: prev },
								}));
							}
						);
					}
				}}
			/>

			{!readOnly && (
				<Button
					className="botonAmarillo"
					marginTop={3}
					width={50}
					onClick={() => setSelectedTab(0)}
				>
					CONFIRMA DOCUMENTACIÓN
				</Button>
			)}
		</Grid>
	);
};

export default DenunciasFormDocumentaicon;
