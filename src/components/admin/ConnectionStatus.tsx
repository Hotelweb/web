interface ConnectionStatusProps {
    isConnected: boolean;
}

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
    return (
        <div className="flex items-center gap-2">
            <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${isConnected ? "bg-green-500" : "bg-amber-500 animate-pulse"
                    }`}
                aria-hidden="true"
            />
            <span
                className={`text-sm font-medium ${isConnected ? "text-green-700" : "text-amber-700"
                    }`}
            >
                {isConnected ? "Online" : "Connecting..."}
            </span>
        </div>
    );
}
