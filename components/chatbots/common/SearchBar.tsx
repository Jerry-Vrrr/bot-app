import { Search, X } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  inputPlaceholder: string;
  setSearchTerm: (value: string) => void;
}

export default function SearchBar({ searchTerm, setSearchTerm, inputPlaceholder }: SearchBarProps) {
  return (
    <div className="flex justify-center py-4 max-w-[500px] w-full mx-auto relative">
      <div className="relative w-full">
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2"><Search size={18} /></div>
        <input
          type="text"
          placeholder={inputPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-3 border-black rounded-3xl w-full pl-7 py-3 text-sm pr-10 outline-none"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
