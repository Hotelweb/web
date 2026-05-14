import type { LocationWithPreview } from "../../types";

interface LocationItemProps {
    location: LocationWithPreview;
    isSelected: boolean;
    onClick: () => void;
}

export function LocationItem({ location, isSelected, onClick }: LocationItemProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors cursor-pointer ${isSelected
                ? "bg-blue-50 border-l-4 border-blue-600"
                : "hover:bg-gray-50 border-l-4 border-transparent"
                }`}
            aria-current={isSelected ? "true" : undefined}
        >
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">
                    {location.name}
                </p>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                    {location.latestMessage
                        ? location.latestMessage.content
                        : "No messages yet"}
                </p>
            </div>

            {location.unreadCount > 0 && (
                <span className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                    {location.unreadCount > 99 ? "99+" : location.unreadCount}
                </span>
            )}
        </button>
    );
}
