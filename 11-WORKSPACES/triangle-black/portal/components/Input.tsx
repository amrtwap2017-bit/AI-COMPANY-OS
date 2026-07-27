// @ts-nocheck
// Triangle Black - Input (enterprise-aligned)

interface InputProps {
  label?:       string;
  placeholder?: string;
  value?:       string;
  onChange?:    (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?:        string;
  required?:    boolean;
  disabled?:    boolean;
  className?:   string;
  id?:          string;
  name?:        string;
}

export function Input({
  label, placeholder, value, onChange,
  type = "text", required, disabled, className = "", id, name,
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={[
          "block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm",
          "text-slate-900 placeholder-slate-400 bg-white",
          "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent",
          "disabled:bg-slate-50 disabled:text-tertiary disabled:cursor-not-allowed",
          "transition-colors",
          className,
        ].join(" ")}
      />
    </div>
  );
}
