import {SiteNav} from '@/components/site-nav';import {AuthForm} from '@/components/auth-form';import type {Metadata} from 'next';
export const metadata:Metadata={title:'Create your space',robots:{index:false}};
export default function Signup(){return <><SiteNav/><main className="auth-wrap"><div className="auth-card"><div className="eyebrow">Step into your own corner</div><h1 className="serif">A space for you.</h1><p>Start with an email. Make it feel like home in minutes.</p><AuthForm mode="signup"/></div></main></>}
