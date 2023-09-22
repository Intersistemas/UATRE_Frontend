import { useCallback, useEffect, useState } from "react";
import useHttp from "./useHttp";

const useQueryQueue = (
	getConfig = (action = "", params = {}) => ({
		config: {
			baseURL: "",
			method: "",
			endpoint: "",
		},
		params: params,
	})
) => {
	const [myParams] = useState({ getConfig: getConfig });
	const [queryQueue, setQueryQueue] = useState([]);
	const pushQuery = useCallback(
		(
			query = {
				action: "",
				params: {},
				config: {},
				onOk: async (_response) => {},
				onError: async (_error) => {},
				onFinally: async () => {},
			}
		) => setQueryQueue((old) => [...old, query]),
		[]
	);
	const { sendRequest } = useHttp();
	useEffect(() => {
		if (queryQueue.length === 0) return;
		const query = queryQueue[0];
		const queryParams = query?.params ?? {};
		const popQuery = () => setQueryQueue((old) => old.filter((e) => e !== query));
		const endpoint = (path, pars = queryParams) =>
			[
				path,
				Object.keys(pars)
					.map((k) => `${k}=${pars[k]}`)
					.join("&"),
			]
				.filter((e) => e)
				.join("?");
		const onOk = query?.onOk ?? (async (_) => {});
		const onError = query?.onError ??  (async (_) => {});
		const onFinally = async () => {
			if (query.onFinally) query.onFinally();
			popQuery();
		};
		let config, params;
		config = myParams.getConfig(query.action, { ...queryParams });
		if (config) ({ config, params } = config);
		if (config != null) {
			sendRequest(
				{
					...query.config,
					...config,
					endpoint: endpoint(config.endpoint, params ?? queryParams),
				},
				onOk,
				onError,
				onFinally
			);
			return;
		}
		popQuery();
	}, [queryQueue, myParams, sendRequest]);
	return pushQuery;
};

export default useQueryQueue;
