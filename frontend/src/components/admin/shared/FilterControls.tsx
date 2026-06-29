"use client";

import { Grid, List as ListIcon, CheckSquare, Square } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ViewModeToggleProps {
    viewMode: "grid" | "list";
    setViewMode: (mode: "grid" | "list") => void;
}

export function ViewModeToggle({ viewMode, setViewMode }: ViewModeToggleProps) {
    return (
        <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-100">
            <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                    viewMode === "grid"
                        ? "bg-white shadow-sm text-red-600"
                        : "text-slate-400 hover:text-[#003366]"
                }`}
            >
                <Grid size={14} />
            </button>
            <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                    viewMode === "list"
                        ? "bg-white shadow-sm text-red-600"
                        : "text-slate-400 hover:text-[#003366]"
                }`}
            >
                <ListIcon size={14} />
            </button>
        </div>
    );
}

interface SelectAllButtonProps {
    allSelected: boolean;
    onSelectAll: () => void;
}

export function SelectAllButton({ allSelected, onSelectAll }: SelectAllButtonProps) {
    return (
        <button
            onClick={onSelectAll}
            className="text-[10px] font-black uppercase text-slate-400 hover:text-[#003366] tracking-widest flex items-center gap-2"
        >
            {allSelected ? (
                <CheckSquare size={14} className="text-red-600" />
            ) : (
                <Square size={14} />
            )}{" "}
            Select All
        </button>
    );
}

interface SelectionCheckboxProps {
    selected: boolean;
    onClick?: (e: React.MouseEvent) => void;
    showOnHover?: boolean;
}

export function SelectionCheckbox({ selected, onClick, showOnHover = false }: SelectionCheckboxProps) {
    return (
        <span onClick={onClick} className="cursor-pointer">
            {selected ? (
                <CheckSquare size={16} className="text-red-600" />
            ) : (
                <Square
                    size={16}
                    className={showOnHover ? "opacity-0 group-hover:opacity-100 transition-opacity" : ""}
                />
            )}
        </span>
    );
}

interface FilterControlsProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
    sortOptions?: { value: string; label: string }[];
    sortOrder?: string;
    onSortChange?: (value: string) => void;
    filterOptions?: { value: string; label: string }[];
    filterValue?: string;
    onFilterChange?: (value: string) => void;
    selectAllButton?: React.ReactNode;
    viewModeToggle?: React.ReactNode;
}

export function FilterControls({
    searchTerm,
    onSearchChange,
    searchPlaceholder = "Search...",
    sortOptions,
    sortOrder,
    onSortChange,
    filterOptions,
    filterValue,
    onFilterChange,
    selectAllButton,
    viewModeToggle,
}: FilterControlsProps) {
    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
                <div className="relative w-full md:w-[300px] group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={16} />
                    <Input
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="bg-slate-50 border-slate-100 pl-10 h-10 rounded-xl text-xs font-bold uppercase tracking-wider focus:ring-red-600/10 focus:border-red-600 transition-all shadow-none"
                        placeholder={searchPlaceholder}
                    />
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    {filterOptions && onFilterChange && (
                        <select
                            value={filterValue || "all"}
                            onChange={(e) => onFilterChange(e.target.value)}
                            className="bg-slate-50 border-slate-100 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#003366] focus:outline-none focus:ring-2 focus:ring-red-600/20 w-full md:w-auto min-w-[140px]"
                        >
                            {filterOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    )}
                    {sortOptions && onSortChange && (
                        <select
                            value={sortOrder || "newest"}
                            onChange={(e) => onSortChange(e.target.value)}
                            className="bg-slate-50 border-slate-100 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#003366] focus:outline-none focus:ring-2 focus:ring-red-600/20 w-full md:w-auto min-w-[140px]"
                        >
                            {sortOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between w-full lg:w-auto gap-4">
                {selectAllButton}
                {viewModeToggle}
            </div>
        </div>
    );
}
