
export interface Localizable {
    name: string;
    name_mal?: string;
    [key: string]: any;
}

export const getLocalizedName = (item: Localizable | undefined | null, language: 'en' | 'mal'): string => {
    if (!item) return '';
    if (language === 'mal' && item.name_mal) {
        return item.name_mal;
    }
    return item.name;
};
