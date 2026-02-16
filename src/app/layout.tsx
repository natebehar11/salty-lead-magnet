import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import MinimalHeader from '@/components/layout/MinimalHeader';

export const metadata: Metadata = {
  title: {
    default: 'Find Your Trip | SALTY Retreats',
    template: '%s | SALTY Retreats',
  },
  description:
    'Take our trip matcher quiz to find your perfect SALTY retreat, and discover the cheapest flights to get there. Wellness retreats for fun-loving people.',
  metadataBase: new URL('https://explore.getsaltyretreats.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://explore.getsaltyretreats.com',
    siteName: 'SALTY Retreats',
    title: 'Find Your Trip | SALTY Retreats',
    description: 'Take our trip matcher quiz and find the cheapest flights to your dream retreat.',
    images: [{ url: '/images/link-previews/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: '/images/logos/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager — set GTM_ID in .env.local */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <Script
            id="gtm"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');`,
            }}
          />
        )}
        {/* Meta Pixel — set META_PIXEL_ID in .env.local */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
fbq('track', 'PageView');`,
            }}
          />
        )}
      </head>
      <body className="antialiased">
        {/* GTM noscript fallback */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        <MinimalHeader />
        <main className="pt-16">{children}</main>
        {/* Elfsight Google Reviews Widget */}
        <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
