import React from "react";
import { Modal } from "react-bootstrap";
import UseKeyPress from "components/helpers/UseKeyPress";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import modalCss from "components/ui/Modal/Modal.module.css";
import Table from "components/ui/Table/Table";

const tableDef = {
	render: () => <Table />,
	getSelected: () => null,
};

const onCloseDef = (selected = null) => {};

const Lookup = ({ title = "", table = tableDef, onClose = onCloseDef }) => {
	table ??= tableDef;

	onClose ??= onCloseDef;

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onClose(table.getSelected()), "AltKey");

	return (
		<Modal size="xl" centered show >
			<Modal.Header className={modalCss.modalCabecera} closeButton>
				{title}
			</Modal.Header>
			<Modal.Body>
				<Grid col full gap="15px">
					{table.render()}
				</Grid>
			</Modal.Body>
			<Modal.Footer>
				<Grid gap="20px">
					<Grid width="150px">
						<Button
							className="botonAzul"
							onClick={() => onClose(table.getSelected())}
						>
							ELIGE
						</Button>
					</Grid>
					<Grid width="150px">
						<Button className="botonAmarillo" onClick={() => onClose()}>
							CIERRA
						</Button>
					</Grid>
				</Grid>
			</Modal.Footer>
		</Modal>
	);
};

export default Lookup;
