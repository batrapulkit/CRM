export function Button({ children, onClick, className = "", variant = "default", size = "default", ...props }) {
  const base =
    "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500";
  const variants = {
    default: "bg-purple-600 hover:bg-purple-700 text-white",
    destructive: "bg-red-500 hover:bg-red-600 text-white",
    outline: "border border-slate-200 bg-transparent hover:bg-slate-100 text-slate-900",
    secondary: "bg-white text-slate-900 hover:bg-slate-100",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700",
    "ghost-dark": "bg-transparent hover:bg-white/10 text-slate-300 hover:text-white",
    link: "text-purple-600 underline-offset-4 hover:underline",
  };
  const sizes = {
    default: "px-4 py-2 rounded-lg text-sm",
    icon: "p-2 rounded-lg",
  };
  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
