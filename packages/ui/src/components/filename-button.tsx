export const FilenameButton: React.FC<{
  filename?: string;
  onClick: () => void;
}> = ({ filename, onClick }) => {
  if (!filename) {
    return null;
  }
  return (
    <div className="flex items-center justify-between gap-2 border border-gray-300 rounded-md py-1 px-4 bg-gray-50">
      <span className="text-xs font-medium text-gray-800">{filename}</span>
      <button className="cursor-pointer" onClick={onClick}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-x-icon lucide-x"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  );
};
