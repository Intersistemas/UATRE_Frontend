import React from "react";
import UseKeyPress from "components/helpers/UseKeyPress";
import Action from "components/helpers/Action";

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
	if (items === keyPressProps.items) items = [];
	items = (Array.isArray(items) ? items : [items])
		.map((item) => {
			if (item?.keys == null) return null;
			const p = { ...item };
			p.callback ??= item instanceof Action ? item.execute : null;
			if (p.callback == null) return null;
			return <KeyPressItem {...p} />;
		})
		.filter((item) => item);
	return <>{items}</>;
};

export default KeyPress;
