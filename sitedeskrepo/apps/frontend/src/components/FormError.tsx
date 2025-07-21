export const FormError: React.FC<{ error?: string }> = ({ error }) =>
  error ? <div className="text-red-600 mb-2 text-sm">{error}</div> : null;
