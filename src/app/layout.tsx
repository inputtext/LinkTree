import type {Metadata,Viewport} from 'next';import './globals.css';
const base=process.env.NEXT_PUBLIC_SITE_URL??'http://localhost:3000';
export const metadata:Metadata={title:{default:'LinkSpace — Make your corner of the internet',template:'%s | LinkSpace'},description:'One beautiful place for your links, work, bookings and community.',metadataBase:new URL(base),openGraph:{type:'website',title:'LinkSpace',description:'Make your corner of the internet.'},robots:{index:true,follow:true}};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#fcfaf5'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
