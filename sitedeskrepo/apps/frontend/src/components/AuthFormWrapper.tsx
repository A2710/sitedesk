export const AuthFormWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <form className="w-full max-w-md bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
      {children}
    </form>
  </div>
);
