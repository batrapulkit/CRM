// src/components/ui/dialog.jsx
import * as React from "react";

export function Dialog({ open, onOpenChange, children }) {
  const [isOpen, setIsOpen] = React.useState(open);

  React.useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleChange = (val) => {
    setIsOpen(val);
    if (onOpenChange) onOpenChange(val);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            className="bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-lg animate-in fade-in-50 zoom-in-90 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {children}
          </div>
        </div>
      )}
    </>
  );
}

export function DialogContent({ children, className = "" }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function DialogHeader({ children }) {
  return <div className="mb-4 border-b pb-2">{children}</div>;
}

export function DialogTitle({ children }) {
  return <h2 className="text-xl font-semibold text-slate-900">{children}</h2>;
}

export function DialogDescription({ children }) {
  return <p className="text-sm text-slate-600 mt-1">{children}</p>;
}

export function DialogTrigger({ asChild = false, children, onClick }) {
  if (asChild) return React.cloneElement(children, { onClick });
  return (
    <button
      onClick={onClick}
      className="rounded-md bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition-all"
    >
      {children}
    </button>
  );
}

export function DialogFooter({ children }) {
  return <div className="mt-6 flex justify-end gap-3">{children}</div>;
}
