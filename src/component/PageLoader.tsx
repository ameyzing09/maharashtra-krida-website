type PageLoaderProps = {
  variant?: "center" | "overlay";
  label?: string;
};

export default function PageLoader({ variant = "center", label }: PageLoaderProps) {
  const spinner = (
    <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-current border-t-transparent text-lime-500 align-[-0.125em]"></div>
  );

  if (variant === "overlay") {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          {spinner}
          {label && <div className="text-white text-sm">{label}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        {spinner}
        {label && <div className="text-brand-charcoal dark:text-gray-100 text-sm">{label}</div>}
      </div>
    </div>
  );
}


