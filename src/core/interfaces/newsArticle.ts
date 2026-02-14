export interface NewsArticle {
    id: number;
    title: string;
    description: string;
    content?: string; // Opzionale
    link: string;
    image_url: string | null;
    source: string;
    category?: string;
    tags?: string[];
    priority?: number;
    published_at: string;
    created_at?: string;
}
