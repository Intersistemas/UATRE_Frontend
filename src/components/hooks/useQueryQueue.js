import { useCallback, useEffect, useState } from "react";
import useHttp, {
	takeErrorAsync,
	takeFinallyAsync,
	takeOkAsync,
} from "./useHttp";

export class QueryClass {
	action;
	params;
	config;
	onOk;
	onError;
	onFinally;

	constructor({
		action = "",
		params = {},
		config = {},
		onOk = takeOkAsync,
		onError = takeErrorAsync,
		onFinally = takeFinallyAsync,
		...x
	} = {}) {
		this.action = action;
		this.params = params;
		this.config = config;
		this.onOk = onOk;
		this.onError = onError;
		this.onFinally = onFinally;
		Object.assign(this, x);
	}
}

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
	const { sendRequest } = useHttp();
	const [queryQueue, setQueryQueue] = useState({
		processing: null,
		queue: [],
		getConfig,
		sendRequest
	});
	const pushQuery = useCallback(
		(
			query = new QueryClass()
		) => setTimeout(
			() => setQueryQueue((o) => ({ ...o, queue: o.queue.concat(query) })),
			200
		),
		[]
	);
	useEffect(() => {
		if (queryQueue.processing) return;
		if (queryQueue.queue.length === 0) return;
		const query = queryQueue.queue[0];
		setQueryQueue((o) => ({ ...o, processing: query }));
		const getConfig = queryQueue.getConfig;
		const sendRequest = queryQueue.sendRequest;
		const queryParams = query?.params ?? {};
		const popQuery = () => setQueryQueue((o) => ({
			...o,
			processing: null,
			queue: o.queue.filter((e) => e !== o.processing)
		}));
		const endpoint = (path, pars = queryParams) =>
			[
				path,
				new URLSearchParams(pars).toString(),
			]
				.filter((e) => e)
				.join("?");
		const onOk = query?.onOk ?? (async (_) => {});
		const onError = query?.onError ?? (async (_) => {});
		const onFinally = async () => {
			if (query.onFinally) query.onFinally();
			popQuery();
		};
		let config, params;
		config = getConfig(query?.action, { ...queryParams });
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
	}, [queryQueue]);
	return pushQuery;
};

export default useQueryQueue;
