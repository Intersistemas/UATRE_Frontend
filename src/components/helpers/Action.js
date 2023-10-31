export default class Action {
	constructor({ name = "", onExecute = (name) => {} } = {}) {
		this.name = name;
		this.execute = () => onExecute(this.name);
	}
}
