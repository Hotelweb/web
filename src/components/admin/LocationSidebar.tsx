import type { LocationWithPreview } from "../../types";
import { LocationItem } from "./LocationItem";

interface LocationSidebarProps {
    locations: LocationWithPreview[];
    selectedLocationId: string | null;
    onSelectLocation: (locationId: string) => void;
}

export function LocationSidebar({
    locations,
    selectedLocationId,
    onSelectLocation,
}: LocationSidebarProps) {
    return (
        <aside className="w-80 border-r border-gray-200 bg-white flex flex-col h-full">
            <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                    Conversations
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto">
                {locations.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">
                        No locations available
                    </div>
                ) : (
                    <ul role="list" className="divide-y divide-gray-100">
                        {locations.map((location) => (
                            <li key={location.id}>
                                <LocationItem
                                    location={location}
                                    isSelected={location.id === selectedLocationId}
                                    onClick={() => onSelectLocation(location.id)}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </aside>
    );
}
