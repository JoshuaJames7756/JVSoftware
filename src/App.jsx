import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Navbar from './components/Navbar/Navbar';
import Home   from './pages/Home/index';
import Admin  from './pages/Admin/index';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_KEY) {
    throw new Error('VITE_CLERK_PUBLISHABLE_KEY no está definida en .env.local');
}

function ProtectedRoute({ children }) {
    return (
        <>
            <SignedIn>{children}</SignedIn>
            <SignedOut><RedirectToSignIn /></SignedOut>
        </>
    );
}

export default function App() {
    return (
        <ClerkProvider publishableKey={CLERK_KEY}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<><Navbar /><Home /></>} />
                    <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                    <Route path="*" element={
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100dvh', gap:'1rem', fontFamily:'var(--font-sans)' }}>
                            <h1 style={{ fontSize:'3rem', fontWeight:700 }}>404</h1>
                            <p style={{ color:'var(--color-text-muted)' }}>Página no encontrada.</p>
                            <a href="/" style={{ color:'var(--color-accent)', fontWeight:600 }}>← Volver al inicio</a>
                        </div>
                    } />
                </Routes>
            </BrowserRouter>
        </ClerkProvider>
    );
}