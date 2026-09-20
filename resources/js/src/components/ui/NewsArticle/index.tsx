import axios from "axios";

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: { name: string };
  publishedAt: string;
}

export const fetchNewsData = async (): Promise<NewsArticle[]> => {
  try {
    const response = await axios.get(
      `https://gnews.io/api/v4/top-headlines?lang=pt&topic=business&token=829c0a536c2e768180977dd7dab5cc`
    );
    return response.data.articles.slice(0, 2);
  } catch (error) {
    console.error("Erro ao buscar dados de notícias:", error);
    return [];
  }
};
