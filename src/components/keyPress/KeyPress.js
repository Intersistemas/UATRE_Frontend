import React, {useContext} from "react";
import UseKeyPress from "components/helpers/UseKeyPress";
import Action from "components/helpers/Action";
import AuthContext from '../../store/authContext';



const keyPressItemProps = {
	keys: [],
	callback: () => {},
	combination: null,
	node: null,
};
const KeyPressItem = ({
	keys = keyPressItemProps.keys,
	callback = keyPressItemProps.callback,
	combination = keyPressItemProps.combination,
	node = keyPressItemProps.node,
} = {}) => {
	keys ??= keyPressItemProps.keys;
	if (!Array.isArray(keys)) keys = [keys];
	callback ??= keyPressItemProps.callback;
	UseKeyPress(keys, callback, combination, node);
};

const keyPressProps = { items: [keyPressItemProps] };
const KeyPress = ({ items = keyPressProps.items } = {}) => {
	const authContext = useContext(AuthContext);
	const Usuario = authContext.usuario;

	if (items === keyPressProps.items) items = [];
	items = (Array.isArray(items) ? items : [items])
		.map((item) => {
			if (item?.keys == null) return null;
			const p = { ...item };

			if (item.tarea && (Usuario?.roles?.find((r) => r === "Administrador") == null)){
				if (Usuario.modulosTareas.find(t => t.nombreTarea == item.tarea)){ p.callback ??= item instanceof Action ? item.execute : null; }
				else  p.callback = null
			}else{
				p.callback ??= item instanceof Action ? item.execute : null;
			}

			if (p.callback == null) return null;
			return <KeyPressItem {...p} />;
		})
		.filter((item) => item);
	return <>{items}</>;
};

export default KeyPress;
