export const buttonStyles = {
    base: "px-4 py-2 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2",

    variants: {
        // Gold primary button (Yellowish/Escarcha) - Black text for contrast
        primary: "bg-gold-500 text-black hover:bg-gold-400 focus:ring-gold-500 shadow-md hover:shadow-lg",
        // Secondary dark
        secondary: "bg-stone-800 text-white hover:bg-black focus:ring-stone-600 shadow-sm",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        // Outline with Gold border
        outline: "border-2 border-gold-500 text-gold-700 hover:bg-gold-50 focus:ring-gold-500 bg-transparent",
        // Black variant for Hero
        black: "bg-black text-gold-500 hover:bg-stone-900 focus:ring-black shadow-xl border-none"
    }
};
