import { useEffect } from 'react';

interface DisqusCommentsProps {
  shortname: string;
  identifier: string; // habere özgü benzersiz kimlik (news.id)
  url: string;        // haberin mutlak adresi
  title: string;
}

declare global {
  interface Window {
    DISQUS?: any;
    disqus_config?: () => void;
  }
}

// Disqus'u yükler ve haber değişince (SPA navigasyonu) yeniden başlatır.
export const DisqusComments = ({ shortname, identifier, url, title }: DisqusCommentsProps) => {
  useEffect(() => {
    if (!shortname) return;

    const config = function (this: any) {
      this.page.identifier = identifier;
      this.page.url = url;
      this.page.title = title;
    };

    if (window.DISQUS) {
      // Zaten yüklü — yeni haber için sıfırla
      window.DISQUS.reset({ reload: true, config });
      return;
    }

    // İlk yükleme
    window.disqus_config = config;
    const s = document.createElement('script');
    s.src = `https://${shortname}.disqus.com/embed.js`;
    s.setAttribute('data-timestamp', String(Date.now()));
    s.async = true;
    document.body.appendChild(s);
  }, [shortname, identifier, url, title]);

  return (
    <div className="disqus-wrap">
      <div id="disqus_thread" />
      <noscript>
        Yorumları görüntülemek için lütfen JavaScript'i etkinleştirin.
      </noscript>
    </div>
  );
};
