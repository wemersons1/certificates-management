import { FC } from "react";
import { Pagination } from "react-bootstrap";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  handlePageChange: (value: number) => void;
}

const Index: FC<PaginationProps> = ({ totalPages, currentPage, handlePageChange }) => {
 
 const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxVisible = 5;
        let startPage = Math.max(currentPage - Math.floor(maxVisible / 2), 1);
        let endPage = startPage + maxVisible - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(endPage - maxVisible + 1, 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <Pagination.Item
                    key={i}
                    active={i === currentPage}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </Pagination.Item>
            );
        }

        return pageNumbers;
    };

    return (
        <Pagination>
            <Pagination.First
                disabled={currentPage === 1}
                onClick={() => handlePageChange(1)}
            />
            <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
            />
            {renderPageNumbers()}
            <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
            />
            <Pagination.Last
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(totalPages)}
            />
        </Pagination>
    );
};

export default Index;
