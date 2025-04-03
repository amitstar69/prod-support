
import React from 'react';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  PaginationEllipsis
} from './pagination';

interface DeveloperPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const DeveloperPagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  isLoading = false
}: DeveloperPaginationProps) => {
  // Don't render pagination if we have only one page
  if (totalPages <= 1) return null;
  
  // Calculate which page numbers to show
  const getPageNumbers = () => {
    // Always show first, last, current and 1 on each side of current
    const pages = new Set<number>();
    
    // Add first and last pages
    pages.add(1);
    pages.add(totalPages);
    
    // Add current page and pages around it
    for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages, currentPage + 1); i++) {
      pages.add(i);
    }
    
    // Convert to sorted array
    return Array.from(pages).sort((a, b) => a - b);
  };
  
  const pageNumbers = getPageNumbers();
  
  // Insert ellipses where needed
  const renderPaginationItems = () => {
    const items: JSX.Element[] = [];
    
    for (let i = 0; i < pageNumbers.length; i++) {
      const pageNum = pageNumbers[i];
      
      // Add ellipsis if there's a gap between page numbers
      if (i > 0 && pageNumbers[i] - pageNumbers[i - 1] > 1) {
        items.push(
          <PaginationItem key={`ellipsis-${i}`}>
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      // Add the page number
      items.push(
        <PaginationItem key={pageNum}>
          <PaginationLink 
            isActive={pageNum === currentPage}
            onClick={(e) => {
              e.preventDefault();
              if (!isLoading) onPageChange(pageNum);
            }}
            href="#"
          >
            {pageNum}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };
  
  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1 && !isLoading) onPageChange(currentPage - 1);
            }}
            className={`${currentPage === 1 || isLoading ? 'opacity-50 pointer-events-none' : ''}`}
          />
        </PaginationItem>
        
        {renderPaginationItems()}
        
        <PaginationItem>
          <PaginationNext 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages && !isLoading) onPageChange(currentPage + 1);
            }}
            className={`${currentPage === totalPages || isLoading ? 'opacity-50 pointer-events-none' : ''}`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default DeveloperPagination;
