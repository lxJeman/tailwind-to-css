import { Metadata } from 'next';
import TailwindConverter from '@/components/TailwindConverter';
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'Tailwind to CSS Converter - Convert Utility Classes to CSS',
  description: 'Convert Tailwind CSS utility classes to their equivalent CSS code in real-time. Perfect for learning, debugging, and understanding what CSS is generated from your Tailwind classes.',
  keywords: ['Tailwind CSS', 'CSS converter', 'utility classes', 'CSS generator', 'web development'],
  authors: [{ name: 'Tailwind to CSS Converter' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Tailwind to CSS Converter',
    description: 'Convert Tailwind CSS utility classes to their equivalent CSS code in real-time',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tailwind to CSS Converter',
    description: 'Convert Tailwind CSS utility classes to their equivalent CSS code in real-time',
  },
};

export default function Home() {
  return (
    <ErrorBoundary>
      <TailwindConverter />
    </ErrorBoundary>
  );
}
