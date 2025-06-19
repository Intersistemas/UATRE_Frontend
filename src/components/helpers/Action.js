export default class Action {
	constructor({ name = "", onExecute = (name) => {}, ...x } = {}) {
		this.name = name;
		this.execute = () => onExecute(this.name);
		Object.keys(x).forEach((k) => (this[k] = x[k]));
	}
}
