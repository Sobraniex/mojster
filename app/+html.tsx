import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Root HTML for web — phone-first viewport & PWA-friendly meta.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#0A0A0A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Mojster" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="description"
          content="Mojster — craftsman marketplace for home services"
        />
        <title>Mojster</title>
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: responsiveCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveCss = `
html, body, #root {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: #F3F2EF;
  -webkit-tap-highlight-color: transparent;
  -webkit-text-size-adjust: 100%;
  touch-action: manipulation;
}
body {
  overscroll-behavior: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
/* Full-bleed phone on real devices */
@media (max-width: 480px) {
  html, body, #root {
    background: #F3F2EF;
  }
}
`;
