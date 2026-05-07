import './globals.css'
import { Outfit } from 'next/font/google'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata = {
  title: 'FamTalk | 家族会議サポーター',
  description: '家族のコミュニケーションを、もっと楽しく、もっとスムーズに。',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FamTalk',
  },
}

export const viewport = {
  themeColor: '#f48fb1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body className={outfit.className}>
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  )
}
