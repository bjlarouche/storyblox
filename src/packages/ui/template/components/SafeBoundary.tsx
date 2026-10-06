import React, { useState } from "@rbxts/react";
import { ErrorBoundary } from "@rbxts/uiblox";
import ErrorPanel from "./ErrorPanel";

export interface SafeBoundaryProps {
	resetKey?: string;
	compact?: boolean;
	children?: React.Element | (React.Element | undefined)[];
}

function SafeBoundary({ resetKey = "", compact = false, children }: SafeBoundaryProps) {
	const [retry, setRetry] = useState(0);

	return (
		<ErrorBoundary
			key={`${resetKey}:${retry}`}
			fallback={(failure) => (
				<ErrorPanel
					key="SafeBoundaryFallback"
					message={`${failure}`}
					compact={compact}
					onRetry={() => setRetry((current) => current + 1)}
				/>
			)}
		>
			{children}
		</ErrorBoundary>
	);
}

export default SafeBoundary;
