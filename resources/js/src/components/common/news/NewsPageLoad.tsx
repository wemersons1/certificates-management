import { useEffect, useState } from 'react';
import NewsSlider from './NewsSliderProps';

interface NewsArticle {
    content: string;
    description: string;
    image: string;
    publishedAt: string;
    source: {
        name: string;
    };
    url: string; 
}

const NewsPage = () => {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadNews = () => {
        setIsLoading(true);
        fetch('http://127.0.0.1:8000/api/v1/news') 
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao carregar notícias');
                }
                return response.json(); 
            })
            .then(data => {
                const formattedNews = data.map((item: any) => ({
                    content: item.content || '',
                    description: item.content || '', 
                    image: item.image_url || 'default-image.jpg',
                    publishedAt: item.published_at || '',
                    source: {
                        name: item.title || 'Sem título',
                    },
                    url: item.link || '#', 
                }));
                setNews(formattedNews); 
            })
            .catch(error => {
                console.error('Erro ao carregar notícias:', error.message);
            })
            .finally(() => {
                setIsLoading(false); 
            });
    };

    useEffect(() => {
        loadNews(); 
    }, []);

    return (
        <div>
            {isLoading && <p>Carregando...</p>}
            <NewsSlider news={news} />
        </div>
    );
};

export default NewsPage;
