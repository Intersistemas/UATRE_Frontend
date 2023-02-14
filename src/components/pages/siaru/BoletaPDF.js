import { Document, Page, View, Text } from "@react-pdf/renderer";
import React from "react";
import styles from "./BoletaPDF.module.css";

const BoletaPDF = (props) => {
	const {config, ...rest} = props;
	const data = config.data;
	const empresa = config.empresa;
	const establecimiento = config.establecimiento;

	return (
			<Document className={styles.document}>
				<Page className={styles.page} size="A4">
					<View className={styles.section}>
						<Text>{empresa?.razonSocial ?? ""}</Text>
					</View>
					<View className={styles.section}>
						<Text>{establecimiento?.nombre ?? ""}</Text>
					</View>
				</Page>
			</Document>
	);
};

export default BoletaPDF;
