import {SiteNav} from '@/components/site-nav';import {AuthForm} from '@/components/auth-form';import type {Metadata} from 'next';
export const metadata:Metadata={title:'Welcome back',robots:{index:false}};
export default function Login(){return <><SiteNav/><main className="auth-wrap"><div className="auth-card"><div className="eyebrow">Your space awaits</div><h1 className="serif">Welcome back.</h1><p>Pick up right where your creativity left off.</p><AuthForm mode="login"/></div></main></>}
