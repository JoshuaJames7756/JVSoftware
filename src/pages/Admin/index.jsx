// ============================================================
//  pages/Admin/index.jsx — Dashboard Maestro
//  Xion Technology — Protocolo 4.2 (Admin Edition)
// ============================================================

import { useState } from 'react';
import { useAuth, UserButton } from '@clerk/clerk-react';
import LeadsTable   from '../../components/admin/LeadsTable/LeadsTable';
import ProjectForm  from '../../components/admin/ProjectForm/ProjectForm';
import styles from './Admin.module.css';

const TABS = [
    { id: 'leads',     label: '📥 Mensajes entrantes' },
    { id: 'portfolio', label: '🗂️ Portafolio'         },
];

export default function Admin() {
    const { isLoaded, isSignedIn } = useAuth();
    const [activeTab, setActiveTab] = useState('leads');

    // Estado de carga optimizado con branding
    if (!isLoaded) {
        return (
            <div className={styles.loading} role="status" aria-live="polite">
                <div className={styles.spinner} aria-hidden="true" />
                <p className={styles.loadingText}>Sincronizando con Xion Technology…</p>
            </div>
        );
    }

    // Seguridad: Acceso restringido
    if (!isSignedIn) {
        return (
            <div className={styles.denied} role="alert">
                <p>Acceso restringido. <a href="/sign-in">Inicia sesión</a> para continuar.</p>
            </div>
        );
    }

    return (
        <div className={styles.admin}>

            {/* Header Superior con Logo Oficial PNG */}
            <header className={styles.header}>
                <div className={`container ${styles.headerInner}`}>
                    <div className={styles.brand}>
                        <div className={styles.logoWrapper}>
                            <img 
                                src="/logo.png" 
                                alt="Xion Logo" 
                                className={styles.logoImg} 
                            />
                        </div>
                        <div className={styles.brandInfo}>
                            <h1 className={styles.brandName}>Xion Technology</h1>
                            <p className={styles.brandSub}>Panel de Control Maestro</p>
                        </div>
                    </div>
                    
                    <div className={styles.userArea}>
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </header>

            {/* Barra de Navegación de Secciones (Tabs) */}
            <nav className={styles.tabs} aria-label="Secciones administrativas">
                <div className="container">
                    <div className={styles.tabList} role="tablist">
                        {TABS.map(({ id, label }) => (
                            <button
                                key={id}
                                role="tab"
                                id={`tab-${id}`}
                                aria-selected={activeTab === id}
                                aria-controls={`panel-${id}`}
                                className={`${styles.tab} ${activeTab === id ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab(id)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Contenido Principal */}
            <main className={styles.content}>
                <div className="container">

                    <div
                        id="panel-leads"
                        role="tabpanel"
                        aria-labelledby="tab-leads"
                        hidden={activeTab !== 'leads'}
                        className={styles.panelFade}
                    >
                        {activeTab === 'leads' && <LeadsTable />}
                    </div>

                    <div
                        id="panel-portfolio"
                        role="tabpanel"
                        aria-labelledby="tab-portfolio"
                        hidden={activeTab !== 'portfolio'}
                        className={styles.panelFade}
                    >
                        {activeTab === 'portfolio' && <ProjectForm />}
                    </div>

                </div>
            </main>

        </div>
    );
}