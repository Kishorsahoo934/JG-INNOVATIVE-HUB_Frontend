import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import EShopHeader from './EShopHeader';
import Footer from './Footer';

interface EShopLayoutProps {
  children: ReactNode;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  hideSearch?: boolean;
}

const EShopLayout = ({ children, searchQuery, onSearchChange, hideSearch = false }: EShopLayoutProps) => {
  const location = useLocation();
  const isProjectPage = location.pathname.startsWith('/project-kits') || location.pathname.startsWith('/project/');

  const paddingClass = isProjectPage
    ? (hideSearch ? 'pt-16 sm:pt-20 lg:pt-24' : 'pt-28 sm:pt-32 lg:pt-24')
    : (hideSearch ? 'pt-24 sm:pt-28 lg:pt-36' : 'pt-28 sm:pt-32 lg:pt-40');

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-background overflow-x-hidden">
      <EShopHeader searchQuery={searchQuery} onSearchChange={onSearchChange} hideSearch={hideSearch} />
      <main className={`flex-1 flex flex-col w-full max-w-full overflow-x-hidden ${paddingClass}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default EShopLayout;
