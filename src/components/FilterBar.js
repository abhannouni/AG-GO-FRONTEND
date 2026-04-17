import React, { useState, useEffect, useRef } from 'react';

/* ─── Icons ─────────────────────────────────────────────────────── */

const SearchIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="11" cy="11" r="8" />
        <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
    </svg>
);

const XIcon = ({ className = 'w-3 h-3' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ChevronDownIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

/* ─── SelectControl ──────────────────────────────────────────────── */

/**
 * A styled <select> with an overlay chevron icon.
 * Highlights with forest-green tones when the value differs from defaultValue.
 */
const SelectControl = ({ id, label, value, defaultValue, options, onChange }) => {
    const active = value !== defaultValue;
    return (
        <div className="relative">
            <label htmlFor={`filter-${id}`} className="sr-only">{label}</label>
            <select
                id={`filter-${id}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`
                    appearance-none cursor-pointer text-xs font-medium rounded-full border
                    pl-3.5 pr-7 py-2.5 focus:outline-none focus:ring-2 focus:ring-forest-900/20
                    transition-colors
                    ${active
                        ? 'border-forest-400 text-forest-800 bg-forest-50'
                        : 'border-gray-200 text-gray-700 bg-white hover:border-gray-300'}
                `}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <span className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 ${active ? 'text-forest-600' : 'text-gray-400'}`}>
                <ChevronDownIcon />
            </span>
        </div>
    );
};

/* ─── FilterBar ──────────────────────────────────────────────────── */

/**
 * Reusable sticky filter bar with:
 *  - Debounced search input (400 ms)
 *  - Category pill buttons (horizontal scroll on overflow)
 *  - Arbitrary extra select filters
 *  - Sort select
 *  - Active-filter chips row with individual × removal
 *  - "Reset all" button when any filter is active
 *  - Extra `actions` slot for additional buttons
 *
 * Props
 * ─────────────────────────────────────────────────────────────────
 * searchQuery        string
 * onSearchChange     (val: string) => void        (debounced 400 ms)
 * searchPlaceholder  string
 *
 * categories         string[]                     include the default value (e.g. 'All')
 * activeCategory     string
 * defaultCategory    string                       value that means "no filter" (e.g. 'All')
 * onCategoryChange   (cat: string) => void
 *
 * selects            SelectConfig[]
 *   SelectConfig: { id, label, value, defaultValue, onChange, options: {value,label}[] }
 *
 * sortOptions        { value, label }[]
 * sortBy             string
 * defaultSort        string
 * onSortChange       (val: string) => void
 *
 * onReset            () => void
 * actions            ReactNode                    extra buttons rendered right of selects
 */
const FilterBar = ({
    searchQuery = '',
    onSearchChange,
    searchPlaceholder = 'Search…',
    categories = [],
    activeCategory,
    defaultCategory = 'All',
    onCategoryChange,
    selects = [],
    sortOptions = [],
    sortBy,
    defaultSort,
    onSortChange,
    onReset,
    actions,
}) => {
    // Local controlled state for the input — gives instant visual feedback
    // while deferring the actual filter update via debounce.
    const [inputValue, setInputValue] = useState(searchQuery);
    const timer = useRef(null);

    // Mirror resets from the parent (e.g. "Reset all" clears searchQuery → '').
    useEffect(() => {
        setInputValue(searchQuery);
    }, [searchQuery]);

    // Clean up pending timer on unmount.
    useEffect(() => () => clearTimeout(timer.current), []);

    const handleInput = (e) => {
        const val = e.target.value;
        setInputValue(val);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => onSearchChange?.(val), 400);
    };

    const clearSearch = () => {
        setInputValue('');
        clearTimeout(timer.current);
        onSearchChange?.('');
    };

    /* ── Derive active-filter chips ─────────────────────────────── */
    const chips = [];

    if (searchQuery.trim()) {
        chips.push({
            id: 'search',
            label: `"${searchQuery.trim()}"`,
            onRemove: clearSearch,
        });
    }

    if (activeCategory && activeCategory !== defaultCategory) {
        chips.push({
            id: 'category',
            label: activeCategory,
            onRemove: () => onCategoryChange?.(defaultCategory),
        });
    }

    for (const sel of selects) {
        if (sel.value !== sel.defaultValue) {
            const optLabel = sel.options.find((o) => o.value === sel.value)?.label ?? sel.value;
            chips.push({
                id: sel.id,
                label: `${sel.label}: ${optLabel}`,
                onRemove: () => sel.onChange(sel.defaultValue),
            });
        }
    }

    if (sortBy != null && defaultSort != null && sortBy !== defaultSort) {
        chips.push({
            id: 'sort',
            label: `Sort: ${sortOptions.find((o) => o.value === sortBy)?.label ?? sortBy}`,
            onRemove: () => onSortChange?.(defaultSort),
        });
    }

    const hasChips = chips.length > 0;

    /* ── Render ─────────────────────────────────────────────────── */
    return (
        <div className="sticky top-[76px] z-40 bg-white border-b border-gray-100 shadow-sm">
            <div className="container mx-auto px-6">

                {/* ── Main filter row ── */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 py-4">

                    {/* Search input */}
                    <div className="relative w-full lg:w-64 flex-shrink-0">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <SearchIcon />
                        </span>
                        <input
                            type="text"
                            aria-label={searchPlaceholder}
                            placeholder={searchPlaceholder}
                            value={inputValue}
                            onChange={handleInput}
                            className={`
                                w-full pl-9 py-2.5 rounded-full border text-sm
                                focus:outline-none focus:ring-2 transition-colors
                                ${inputValue
                                    ? 'pr-8 border-forest-400 bg-forest-50 focus:ring-forest-500/20'
                                    : 'pr-4 border-gray-200 bg-white focus:ring-forest-900/20 focus:border-forest-600'}
                            `}
                        />
                        {inputValue && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                aria-label="Clear search"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                            >
                                <XIcon className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Vertical divider — desktop only */}
                    <div className="hidden lg:block h-6 w-px bg-gray-200 flex-shrink-0" />

                    {/* Category pills — flex, clips and scrolls horizontally on overflow */}
                    {categories.length > 0 && (
                        <div
                            role="group"
                            aria-label="Filter by category"
                            className="flex gap-2 overflow-x-auto no-scrollbar w-full lg:min-w-0 lg:flex-1 py-0.5"
                        >
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => onCategoryChange?.(cat)}
                                    aria-pressed={activeCategory === cat}
                                    className={`
                                        flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold
                                        whitespace-nowrap transition-all
                                        ${activeCategory === cat
                                            ? 'bg-forest-900 text-white shadow-md shadow-forest-900/20'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                                    `}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Right-hand controls: selects, sort, extra actions, reset */}
                    <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto lg:flex-shrink-0">
                        {selects.map((sel) => (
                            <SelectControl
                                key={sel.id}
                                id={sel.id}
                                label={sel.label}
                                value={sel.value}
                                defaultValue={sel.defaultValue}
                                options={sel.options}
                                onChange={sel.onChange}
                            />
                        ))}

                        {sortOptions.length > 0 && (
                            <SelectControl
                                id="sort"
                                label="Sort by"
                                value={sortBy ?? defaultSort}
                                defaultValue={defaultSort}
                                options={sortOptions}
                                onChange={onSortChange ?? (() => { })}
                            />
                        )}

                        {actions}

                        {hasChips && (
                            <button
                                type="button"
                                onClick={onReset}
                                className="px-3 py-2 rounded-full text-xs font-semibold text-crimson hover:bg-red-50 border border-crimson/20 hover:border-crimson/30 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                            >
                                <XIcon className="w-3 h-3" />
                                Reset all
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Active filter chips ── */}
                {hasChips && (
                    <div
                        role="status"
                        aria-live="polite"
                        aria-label="Active filters"
                        className="flex items-center flex-wrap gap-2 pb-3"
                    >
                        <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide select-none">
                            Active:
                        </span>
                        {chips.map((chip) => (
                            <span
                                key={chip.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 border border-forest-100 text-forest-800 text-xs font-medium"
                            >
                                {chip.label}
                                <button
                                    type="button"
                                    onClick={chip.onRemove}
                                    aria-label={`Remove "${chip.label}" filter`}
                                    className="text-forest-400 hover:text-forest-900 transition-colors"
                                >
                                    <XIcon className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default FilterBar;
