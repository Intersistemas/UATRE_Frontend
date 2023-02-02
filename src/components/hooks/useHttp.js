import { useCallback, useState } from 'react';
import getStoredToken from '../../store/getSoredToken';

const useHttp = () => {   


    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null)

    const sendRequest = useCallback(async (configRequest, applyData) => {
        setIsLoading(true);
        setError(null)
        const storedTokenData = getStoredToken()
        console.log("useHttp - storedTokenData", storedTokenData)

        //Agrego Token
        let headers = {...configRequest.headers}
        if(headers.Authorization === "")
        {
            headers = {...headers,
                Authorization: "Bearer " + storedTokenData.token
            }
        }
        
        try {
            const response = await fetch(
                configRequest.url,
                {
                    method: configRequest.method ? configRequest.method : 'GET',
                    headers: headers,
                    body: configRequest.body ? JSON.stringify(configRequest.body) : null
                }
            )
            
            if(!response.ok)
            {
                console.log('error: ',response.status);
                let errorMessage = 'Error ' + response.status + '-' + response.statusText;                
                const errorResponse = await response.json();
                if(errorResponse.statusCode && errorResponse.mensaje)
                {
                    errorMessage = 'Error ' + errorResponse.statusCode + '-' + errorResponse.mensaje
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            applyData(data);

        } catch (error) {
            setError(error.message || 'Error');
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