import { useCallback, useState } from 'react';
import getStoredToken from '../../store/getSoredToken';

export class UseHttpError {
	constructor(base = {}) {
		this.type = null;
		this.code = null;
		this.message = null;
		Object.assign(this, base);
	}

	#errorQuote(e, o = '"', c = o) {
		return e ? (e === "Error" ? null : o + e + c) : e;
	}

	toString() {
		return [
			["Error", this.#errorQuote(this.type, "(", ")")].join(" "),
			[this.code, this.#errorQuote(this.message)].filter((r) => r).join(": "),
		].join(" ");
	}
}

export const takeOk = (data) => {};
export const takeOkAsync = async (data) => {};
/**
 * @param {UseHttpError} error
 */
export const takeError = (error) => {};
/**
 * @param {UseHttpError} error
 */
export const takeErrorAsync = async (error) => {};
export const takeFinally = () => {};
export const takeFinallyAsync = async () => {};
const def = {
	takeOk,
	takeOkAsync,
	takeError,
	takeErrorAsync,
	takeFinally,
	takeFinallyAsync,
};

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
				takeOk = def.takeOk,
				takeError = def.takeError,
				takeFinally = def.takeFinally,
			) => {
        setIsLoading(true);
        setError(null)
        let url = ''

        //DONDE HARÁ EL DEPLOY??
        //const servidor =  process.env.SERVIDOR;
        const servidor =  //process.env.REACT_APP_URL_BASE;
        //'uatredesa';
        //'uatretest';
        'uatre';

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
          case 'Estadisticas':
			        url = `http://${servidor}.intersistemas.net:8205/api`;
              break;
          case "MOCK-SIARU":
              url = `https://b1b923bc-149b-4f82-9ce4-2c1d0e7dec43.mock.pstmn.io/api`;
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

				const take = { ok: false, data: null, error: null };
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
					if (response.ok) {
						take.ok = true;
					} else {
						take.error = {};
						take.error.type = response.statusText;
						take.error.code = response.status;
						take.error.message =
							typeof data === "object" && data != null
								? data.Message ||
								  data.Mensaje ||
								  data.message ||
								  data.mensaje ||
								  data.errors
								: (take.error.message = data);
						take.error.data = data;
						throw Object.assign(new Error(take.error.message), take.error);
					}
					take.data = data;
				} catch (error) {
					take.error = new UseHttpError({ ...take.error, ...error });
					take.error.type ??= error.type ?? "Error";
					take.error.code ??= error.code ?? 0;
					take.error.message ??= error.message ?? "Error";
				} finally {
					if (take.ok) takeOk(take.data);
					else takeError(take.error);
					takeFinally();
					setError(take.error);
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
