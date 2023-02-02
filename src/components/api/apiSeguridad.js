let urlAPI = "";
switch (process.env.NODE_ENV) {
	case "development":
		 
		urlAPI = `http://www.intersistemas.net:8800/api/`;
		break;

	case "production":

		urlAPI = `http://www.intersistemas.net:8800/api/`;
		break;

	default:
		break;
}
console.log("API Seguridad: " + urlAPI);
export default urlAPI;

