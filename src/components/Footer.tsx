import React from 'react';
import { Logo } from './Logo';
import { getSettings } from '../admin/adminStore';
import { Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const settings = getSettings();

  return (
    <footer className="premium-footer">
      <div className="premium-footer-top">
        <div className="premium-footer-container">
          
          {/* Brand & About */}
          <div className="footer-col brand-col">
            <Logo variant="compact" light />
            <p className="footer-description">
              {settings.footerText === "Söz Milletin, Türkiye'nin bağımsız ve ilkeli haber kaynağı. Doğru, tarafsız ve hızlı haberciliğin dijital adresi." 
                ? "Söz Milletin, Türkiye'nin bağımsız ve ilkeli haber kaynağı. Doğru, tarafsız ve hızlı haberciliğin dijital adresi. İleri teknolojimiz ve tarafsız yazar kadromuzla Kocaeli'nin ve Türkiye'nin nabzını tutmaya devam ediyoruz." 
                : (settings.footerText || "Söz Milletin, Türkiye'nin bağımsız ve ilkeli haber kaynağı. Doğru, tarafsız ve hızlı haberciliğin dijital adresi. İleri teknolojimiz ve tarafsız yazar kadromuzla Kocaeli'nin ve Türkiye'nin nabzını tutmaya devam ediyoruz.")}
            </p>
            <div className="social-links">
              <a href={settings.social?.facebook || '#'} target="_blank" rel="noreferrer" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href={settings.social?.twitter || '#'} target="_blank" rel="noreferrer" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href={settings.social?.instagram || '#'} target="_blank" rel="noreferrer" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href={settings.social?.youtube || '#'} target="_blank" rel="noreferrer" aria-label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </div>

          {/* Kurumsal */}
          <div className="footer-col">
            <h4>Kurumsal</h4>
            <ul>
              <li><a href="#">Hakkımızda</a></li>
              <li><a href="#">Künye</a></li>
              <li><a href="#">Yayın İlkeleri</a></li>
              <li><a href="#">Gizlilik Politikası</a></li>
              <li><a href="#">Çerez Politikası</a></li>
            </ul>
          </div>

          {/* Kategoriler */}
          <div className="footer-col">
            <h4>Kategoriler</h4>
            <ul>
              <li><a href="#">Gündem</a></li>
              <li><a href="#">Siyaset</a></li>
              <li><a href="#">Spor</a></li>
              <li><a href="#">Ekonomi</a></li>
              <li><a href="#">Yerel Haberler</a></li>
            </ul>
          </div>

          {/* İletişim */}
          <div className="footer-col contact-col">
            <h4>Bize Ulaşın</h4>
            <ul>
              <li>
                <Mail size={16} />
                <span>{settings.contactEmail || 'info@sozmilletin.com'}</span>
              </li>
              <li>
                <Phone size={16} />
                <span>+90 (500) 000 00 00</span>
              </li>
              <li>
                <MapPin size={16} />
                <span>Kocaeli, Türkiye</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      <div className="premium-footer-bottom">
        <div className="premium-footer-container bottom-container">
          <p className="copyright">
            &copy; {new Date().getFullYear()} Söz Milletin. Tüm Hakları Saklıdır.
          </p>
          <div className="agency-credit">
            <span>Powered by</span>
            <a href="https://220creative.com.tr" target="_blank" rel="noreferrer">
              <img src="/220creative.png" alt="220Creative Digital Agency" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
