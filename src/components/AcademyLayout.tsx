import { ReactNode } from 'react';
import AcademyHeader from './AcademyHeader';
import Footer from './Footer';

interface AcademyLayoutProps {
  children: ReactNode;
}

const AcademyLayout = ({ children }: AcademyLayoutProps) => {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-background overflow-x-hidden">
      <AcademyHeader />
      <main className="flex-1 flex flex-col w-full max-w-full pt-32 md:pt-24">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default AcademyLayout;
