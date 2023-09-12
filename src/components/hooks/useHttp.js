import { useCallback, useState } from 'react';
import getStoredToken from '../../store/getSoredToken';

const useHttp = () => {   
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null)

    const sendRequest = useCallback(async (configRequest, applyData, takeError = (error) => {}) => {
        setIsLoading(true);
        setError(null)
        const storedTokenData = getStoredToken()
        let url = ''

        switch (configRequest.baseURL) {
          case "Comunes":
            url = "http://uatretest.intersistemas.net:8202/api";
            // url = "http://uatre.intersistemas.net:8202/api";
            //url = "https://localhost:7032/api";
            break;
          case "Afiliaciones":
            url = 'http://uatretest.intersistemas.net:8200/api';
            // url = "http://uatre.intersistemas.net:8200/api";
            //url = "http://localhost:5165/api";
            break;
          case "DDJJ":
              url = 'http://uatretest.intersistemas.net:8203/api';
              //url = "http://uatre.intersistemas.net:8203/api";
              //url = "http://localhost:5165/api";
              break;

          case "SIARU":
            url = 'http://uatretest.intersistemas.net:8201/api/v1';
            // url = "http://uatre.intersistemas.net:8201/api/v1";
            break;
            
          case 'Seguridad':
                url = 'http://uatretest.intersistemas.net:8800/api'
                // url = "http://uatre.intersistemas.net:8800/api";
                break;
	
            default:
                break;

        }

				configRequest.bodyToJSON ??= true;
        //Agrego Token
        let headers = {...configRequest.headers}
        if(headers.Authorization === true)
        {
            headers = {...headers,
                Authorization: "Bearer " + storedTokenData.token
            }
        }
        
				if (configRequest.body && configRequest.bodyToJSON)
					headers["Content-Type"] ??= "application/json";
        
				let err;
        try {
            const response = await fetch(
                url + configRequest.endpoint,
                {
                    method: configRequest.method ? configRequest.method : 'GET',
                    headers: headers,
                    body: configRequest.body
											? configRequest.bodyToJSON
												? JSON.stringify(configRequest.body)
												: configRequest.body
											: null,
                }
            )
            
            if(!response.ok)
            {                            
                const errorResponse = await response.json();
                console.log("response not ok", errorResponse);  
                err = {
                  type:
                    errorResponse.StatusCode === 500
                      ? "Internal Server Error"
                      : "Error",
                  code: errorResponse.StatusCode,
                  message: errorResponse.Message || errorResponse.Mensaje,
                };

                setError(err)
                takeError(err)
                
                return //caputo el error en el componente
            }

            const data = await response.json();
            applyData(data);  
            

        } catch (error) {
					if (!err) {
						err = {
							type: "Error",
              code: 0,
							message: error.message,
						};
					}
					takeError(err);
					setError(error.message || "Error");
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading, 
        error,
        sendRequest,
    };
};

export default useHttp;
