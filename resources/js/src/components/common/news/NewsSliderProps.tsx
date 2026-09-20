import { FC } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';

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

interface NewsSliderProps {
    news: NewsArticle[]; 
}

const NewsSlider: FC<NewsSliderProps> = ({ news }) => (
    <Row className="mb-4">
        {news.map((article, index) => (
            <Col xs={12} md={6} key={index}>
                <Card className="shadow-sm rounded">
                    <Card.Img 
                        variant="top" 
                        src={article.image || "default-image.jpg"} 
                        alt="News Image"
                        style={{
                            maxHeight: "200px",
                            maxWidth: "100%",
                            objectFit: "cover",
                        }}
                        onError={(e) => {
                            e.currentTarget.src = "default-image.jpg";
                        }}
                    />
                    <Card.Body>
                        <Card.Title>{article.source.name}</Card.Title>
                        <Card.Text>{article.description}</Card.Text>
                        <Button variant="link" href={article.url} target="_blank" className="text-primary">
                            Leia mais
                        </Button>
                    </Card.Body>
                    <Card.Footer>
                        <small className="text-muted">Publicado em {new Date(article.publishedAt).toLocaleString()}</small>
                    </Card.Footer>
                </Card>
            </Col>
        ))}
    </Row>
);

export default NewsSlider;
