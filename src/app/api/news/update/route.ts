import Parser from "rss-parser"
import { supabase } from "@/core/supabase/client";
import { type NextRequest, NextResponse } from "next/server";

const parser = new Parser();

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const link = searchParams.get('link') || 'https://it.motorsport.com/rss/f1/news/';

    try {
        const feed = await parser.parseURL(link);

        // 1. Preparazione Dati 
        // Trasformiamo tutte le notizie del feed in un array pronto per Supabase
        const newsToInsert = feed.items
            .filter(item => item.link && item.title)
            .map(item => {
                const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();
                const sourceDomain = new URL(link).hostname.replace('www.', '');
                const description = (item.contentSnippet || item.description || item.content || "").substring(0, 200) + "...";
                const content = item['content:encoded'] || item.content || item.description || "";


                return {
                    title: item.title!.trim(),
                    link: item.link!,
                    description: description,
                    content: content,
                    image_url: item.enclosure?.url || null,
                    source: sourceDomain,
                    published_at: publishedAt.toISOString(),
                    category: 'F1',
                    tags: ['F1', 'News']
                };
            });

        if (newsToInsert.length === 0) {
            return NextResponse.json({ success: true, count: 0, message: "Nessuna news valida trovata" });
        }

        // 2. Esecuzione UPSERT
        // Inserisce le news nuove e IGNORA quelle che esistono già (grazie a onConflict)
        const { error, count } = await supabase
            .from('news')
            .upsert(newsToInsert, {
                onConflict: 'link',
                ignoreDuplicates: true
            });

        if (error) {
            console.error("Errore Supabase:", error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            parsed: newsToInsert.length,
            message: "Sincronizzazione completata con successo"
        });

    } catch (error) {
        console.error("Errore RSS:", error);
        return NextResponse.json({ success: false, error: "Errore nel parsing del feed" }, { status: 500 });
    }
}