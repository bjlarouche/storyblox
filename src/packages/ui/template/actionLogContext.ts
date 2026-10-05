import React from "@rbxts/react";

export interface ActionLogApi {
	record: (name: string, ...values: unknown[]) => void;
	disabled: boolean;
}

export const ActionLogContext = React.createContext<ActionLogApi | undefined>(undefined);

export function useActionLog(): ActionLogApi {
	const api = React.useContext(ActionLogContext);
	if (api === undefined) {
		return {
			record: () => {},
			disabled: true,
		};
	}
	return api;
}
