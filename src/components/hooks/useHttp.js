import { useCallback, useState } from 'react';
import getStoredToken from '../../store/getSoredToken';

const useHttp = () => {   
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null)

    const sendRequest = useCallback(
			async (
				{
					baseURL = "",
					headers = {},
					method = "GET",
					endpoint = "",
					okType = "json",
					errorType = "json",
					bodyToJSON = true,
					body,
					...configRequest
				},
				takeOk = (data) => {},
				takeError = (error) => {},
				takeFinally = () => {}
			) => {
        setIsLoading(true);
        setError(null)
        let url = ''

        //DONDE HARÁ EL DEPLOY??
        //const servidor =  process.env.SERVIDOR;
        const servidor =  //process.env.REACT_APP_URL_BASE;
        'uatredesa';
        //'uatretest';
        //'uatre';

        switch (baseURL) {
          case "Comunes":
              url = `http://${servidor}.intersistemas.net:8202/api`;
              break;
          case "Afiliaciones":
              url = `http://${servidor}.intersistemas.net:8200/api`;
              break;
          case "DDJJ":
              url = `http://${servidor}.intersistemas.net:8203/api`;
              break;
          case "SIARU":
              url = `http://${servidor}.intersistemas.net:8201/api`;
              break;
          case 'Seguridad':
              url = `http://${servidor}.intersistemas.net:8800/api`;
              break;
					default:
							break;
        }

        //Configuracion fetch
				const config = {
					method,
					headers: { ...headers },
					...configRequest,
				};

				if (body != null) {
					if (bodyToJSON) {
						config.headers["Content-Type"] ??= "application/json";
						config.body = JSON.stringify(body);
					} else {
						config.body = body;
					}
				}

				if (config.headers.Authorization === true)
					config.headers.Authorization = `Bearer ${getStoredToken().token}`;

				const errorBase = {};
				try {
					const response = await fetch(`${url}${endpoint}`, config);

					const decodeType = async (type = "") => {
						switch (type?.toString().trim().toLowerCase()) {
							case "json":
								return response.json();
							case "text":
								return response.text();
							case "blob":
								return response.blob();
							case "formdata":
								return response.formData();
							case "arrayBuffer":
								return response.arrayBuffer();
							default:
								return response;
						}
					}

					const data = await decodeType(response.ok ? okType : errorType);
					if (!response.ok) {
						errorBase.type = response.statusText;
						errorBase.code = response.status;
						errorBase.message =
							typeof data === "object" && data != null
								? data.Message ||
								  data.Mensaje ||
								  data.message ||
								  data.mensaje ||
								  data.errors
								: (errorBase.message = data);
						errorBase.data = data;
						throw Object.assign(new Error(errorBase.message), errorBase);
					}
					takeOk(data);
				} catch (error) {
					error = { ...errorBase, ...error };
					error.type ??= "Error";
					error.code ??= 0;
					error.message ??= "Error";
					takeError(error);
					setError(error);
				} finally {
					takeFinally();
					setIsLoading(false);
				}
			},
			[]
		);

    return {
        isLoading, 
        error,
        sendRequest,
    };
};

export default useHttp;
