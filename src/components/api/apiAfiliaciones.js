
let urlAPI = "";
switch (process.env.NODE_ENV) {
	case "development":
		 
		urlAPI = `http://www.intersistemas.net:8200/api/`;
		break;

	case "production":

		urlAPI = `http://www.intersistemas.net:8200/api/`;
		break;

	default:
		break;
}
console.log("API Afiliaciones: " + urlAPI);
export default urlAPI;
