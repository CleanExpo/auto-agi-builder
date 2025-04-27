import { Html, Head, Main, NextScript } from 'next/document'

/**
 * Custom document for Next.js
 * Extends default document to customize the html structure
 */
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Auto AGI Builder - Build AI Applications Faster" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
