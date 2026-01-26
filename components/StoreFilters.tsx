import React, { useState } from 'react';

export interface FilterState {
    searchQuery: string;
    selectedCategories: string[];
    priceRange: [number, number];
    selectedSizes: string[];
    selectedColors: string[];
}

interface StoreFiltersProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    categories: string[];
    maxPrice: number;
    availableSizes: string[];
    availableColors: string[];
}

export const StoreFilters: React.FC<StoreFiltersProps> = ({ filters, onFilterChange, categories, maxPrice, availableSizes, availableColors }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange({ ...filters, searchQuery: e.target.value });
    };

    const toggleCategory = (category: string) => {
        const newCategories = filters.selectedCategories.includes(category)
            ? filters.selectedCategories.filter(c => c !== category)
            : [...filters.selectedCategories, category];
        onFilterChange({ ...filters, selectedCategories: newCategories });
    };

    const toggleSize = (size: string) => {
        const newSizes = filters.selectedSizes.includes(size)
            ? filters.selectedSizes.filter(s => s !== size)
            : [...filters.selectedSizes, size];
        onFilterChange({ ...filters, selectedSizes: newSizes });
    };

    const toggleColor = (color: string) => {
        const newColors = filters.selectedColors.includes(color)
            ? filters.selectedColors.filter(c => c !== color)
            : [...filters.selectedColors, color];
        onFilterChange({ ...filters, selectedColors: newColors });
    };

    const handlePriceChange = (index: 0 | 1, value: number) => {
        const newRange: [number, number] = [filters.priceRange[0], filters.priceRange[1]];
        newRange[index] = value;
        onFilterChange({ ...filters, priceRange: newRange });
    };

    const clearFilters = () => {
        onFilterChange({
            searchQuery: '',
            selectedCategories: [],
            priceRange: [0, maxPrice],
            selectedSizes: [],
            selectedColors: []
        });
    };

    const hasActiveFilters = filters.searchQuery || filters.selectedCategories.length > 0 ||
        filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice ||
        filters.selectedSizes.length > 0 || filters.selectedColors.length > 0;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                    </svg>
                    <h3 className={styles.title}>Filtros</h3>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={styles.toggleButton}
                >
                    <svg
                        className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
            </div>

            {isExpanded && (
                <div className={styles.content}>
                    {/* Search */}
                    <div className={styles.section}>
                        <label className={styles.label}>Buscar</label>
                        <input
                            type="text"
                            value={filters.searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Nombre del producto..."
                            className={styles.searchInput}
                        />
                    </div>

                    {/* Categories */}
                    <div className={styles.section}>
                        <label className={styles.label}>Categorías</label>
                        <div className={styles.checkboxGroup}>
                            {categories.map(category => (
                                <label key={category} className={styles.checkbox}>
                                    <input
                                        type="checkbox"
                                        checked={filters.selectedCategories.includes(category)}
                                        onChange={() => toggleCategory(category)}
                                        className={styles.checkboxInput}
                                    />
                                    <span className={styles.checkboxLabel}>{category}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Sizes */}
                    {availableSizes.length > 0 && (
                        <div className={styles.section}>
                            <label className={styles.label}>Talla</label>
                            <div className="flex flex-wrap gap-2">
                                {availableSizes.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => toggleSize(size)}
                                        className={`${styles.variantButton} ${filters.selectedSizes.includes(size) ? styles.variantButtonActive : ''}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Colors */}
                    {availableColors.length > 0 && (
                        <div className={styles.section}>
                            <label className={styles.label}>Color</label>
                            <div className="flex flex-wrap gap-2">
                                {availableColors.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => toggleColor(color)}
                                        className={`${styles.variantButton} ${filters.selectedColors.includes(color) ? styles.variantButtonActive : ''}`}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Price Range */}
                    <div className={styles.section}>
                        <label className={styles.label}>
                            Rango de Precio: S/ {filters.priceRange[0]} - S/ {filters.priceRange[1]}
                        </label>
                        <div className={styles.priceInputs}>
                            <input
                                type="number"
                                value={filters.priceRange[0]}
                                onChange={(e) => handlePriceChange(0, Number(e.target.value))}
                                min={0}
                                max={filters.priceRange[1]}
                                className={styles.priceInput}
                            />
                            <span className="text-stone-500">-</span>
                            <input
                                type="number"
                                value={filters.priceRange[1]}
                                onChange={(e) => handlePriceChange(1, Number(e.target.value))}
                                min={filters.priceRange[0]}
                                max={maxPrice}
                                className={styles.priceInput}
                            />
                        </div>
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <button onClick={clearFilters} className={styles.clearButton}>
                            Limpiar Filtros
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: "bg-white rounded-xl shadow-sm border border-stone-200 p-4 md:p-6 sticky top-4",
    header: "flex items-center justify-between mb-4 md:mb-6",
    title: "text-lg md:text-xl font-bold text-black",
    toggleButton: "lg:hidden text-stone-600 hover:text-black transition-colors p-1",
    content: "space-y-4 md:space-y-6",
    section: "space-y-2",
    label: "block text-sm font-bold text-stone-900",
    searchInput: "w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white text-black font-medium focus:ring-2 focus:ring-gold-500 outline-none",
    checkboxGroup: "space-y-2",
    checkbox: "flex items-center gap-2 cursor-pointer hover:bg-stone-50 p-2 rounded transition-colors",
    checkboxInput: "w-4 h-4 accent-gold-500 cursor-pointer",
    checkboxLabel: "text-sm text-stone-800 font-medium",
    variantButton: "px-3 py-1.5 border-2 border-stone-300 rounded-lg font-medium text-sm text-stone-800 hover:border-gold-500 transition-colors",
    variantButtonActive: "!border-gold-600 !bg-gold-50 !text-black font-bold",
    priceInputs: "flex items-center gap-2",
    priceInput: "flex-1 px-2 py-1.5 text-sm border border-stone-300 rounded-lg text-black font-medium focus:ring-2 focus:ring-gold-500 outline-none",
    clearButton: "w-full bg-stone-100 hover:bg-stone-200 text-black font-bold py-2 px-4 rounded-lg transition-colors text-sm"
};
