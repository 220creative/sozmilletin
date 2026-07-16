import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>Sayfa Bulunamadı (404) — SÖZ MİLLETİN</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <main className="main-content" style={{ textAlign: 'center', padding: '120px 20px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '64px', margin: 0, color: 'var(--accent-red)' }}>404</h1>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', marginBottom: '12px' }}>Sayfa bulunamadı</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir.
        </p>
        <Link to="/" className="back-btn"><ChevronLeft size={16} /> Ana sayfaya dön</Link>
      </main>
    </>
  );
};
