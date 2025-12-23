import { Search, X } from 'lucide-react';
import { Input } from './input';
import { useState } from 'react';

interface SearchBarProps {
    isOpen: boolean;
    onToggle: () => void;
}

export default function SearchBar({ isOpen, onToggle }: SearchBarProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Search:', searchQuery);
    };

    return (
        <div className="fixed top-[4.75rem] left-1/2 -translate-x-1/2 h-14 z-[39] flex items-center justify-center gap-2">
            {isOpen && (
                <button
                    onClick={onToggle}
                    className="flex-shrink-0 bg-white/70 hover:bg-white/85 backdrop-blur-lg rounded-full p-1 text-gray-700 hover:text-gray-900 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                >
                    <X className="w-3 h-3 stroke-[2.5]" />
                </button>
            )}
            <div
                className={`
                    transition-all duration-300 ease-out p-1
                    ${isOpen ? 'w-[240px] sm:w-[320px] lg:w-[400px] xl:w-[480px]' : 'w-0'}
                `}
            >
                <form onSubmit={handleSearch} className="relative group">
                    <div className="
                        relative bg-white/70 backdrop-blur-lg rounded-2xl overflow-hidden
                        shadow-lg shadow-black/10
                        hover:bg-white/85 hover:shadow-xl hover:shadow-black/20 hover:scale-[1.02]
                        focus-within:bg-white/95 focus-within:shadow-2xl focus-within:shadow-blue-500/20 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:scale-[1.02]
                        transition-all duration-300 ease-out
                    ">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none transition-colors duration-200 group-hover:text-gray-600 group-focus-within:text-blue-500 z-10" />
                        <Input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="
                                w-full
                                pl-12 pr-12 py-3
                                bg-transparent text-gray-900
                                placeholder-gray-400
                                rounded-2xl border-0
                                focus-visible:outline-none focus-visible:ring-0
                                focus-visible:placeholder-gray-300
                                transition-all duration-200
                            "
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-all duration-200 p-1.5 rounded-full active:scale-95"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}