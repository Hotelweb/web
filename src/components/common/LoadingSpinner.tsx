interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
}

const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
};

export function LoadingSpinner({ size = "md" }: LoadingSpinnerProps) {
    return (
        <div className="flex items-center justify-center" role="status">
            <div
                className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-border border-t-primary`}
            />
            <span className="sr-only">Loading...</span>
        </div>
    );
}
