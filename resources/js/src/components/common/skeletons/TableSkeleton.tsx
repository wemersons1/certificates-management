import React from 'react';
import styles from './TableSkeleton.module.css';

interface TableSkeletonProps {
    columns: number;
    rows?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ columns, rows = 5 }) => {
    return (
        <tbody>
            {[...Array(rows)].map((_, rowIndex) => (
                <tr key={rowIndex} className={styles.skeletonRow}>
                    {[...Array(columns)].map((_, colIndex) => (
                        <td key={colIndex}>
                            <div
                                className={`${styles.skeletonCell} ${colIndex === columns - 1 ? styles.skeletonCellSmall : ''}`}
                            />
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    );
};

export default TableSkeleton;
