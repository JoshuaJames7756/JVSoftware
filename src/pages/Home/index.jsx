// ============================================================
//  pages/Home/index.jsx — Página pública principal
//  Ensambla todos los componentes en orden
// ============================================================

import { useEffect } from 'react';
import Hero      from '../../components/Hero/Hero';
import Services  from '../../components/Services/Services';
import Portfolio from '../../components/Portfolio/Portfolio';
import Contact   from '../../components/Contact/Contact';
import Footer    from '../../components/Footer/Footer';

export default function Home() {
    // SEO dinámico básico
    useEffect(() => {
        document.title = 'Xion Technology — Sistemas digitales que hacen crecer tu negocio';
        const desc = document.querySelector('meta[name="description"]');
        if (desc) {
            desc.setAttribute('content',
                'Creamos sistemas de inventario, catálogos digitales, tiendas online y paneles de gestión para dueños de negocios. Sin jerga técnica, con soporte incluido.'
            );
        }
    }, []);

    return (
        <main>
            <Hero />
            <Services />
            <Portfolio />
            <Contact />
            <Footer />
        </main>
    );
}