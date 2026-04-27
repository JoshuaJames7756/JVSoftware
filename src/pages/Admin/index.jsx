// ============================================================
//  pages/Admin/index.jsx — Dashboard privado
//  Protegido por Clerk — solo accede si hay sesión activa
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

    // Mientras Clerk carga
    if (!isLoaded) {
        return (
            <div className={styles.loading} role="status" aria-live="polite">
                <div className={styles.spinner} aria-hidden="true" />
                <p>Verificando acceso…</p>
            </div>
        );
    }

    // Si no hay sesión activa (no debería llegar aquí si App.jsx usa <RedirectToSignIn>)
    if (!isSignedIn) {
        return (
            <div className={styles.denied} role="alert">
                <p>Acceso denegado. <a href="/sign-in">Inicia sesión</a>.</p>
            </div>
        );
    }

    return (
        <div className={styles.admin}>

            {/* Header del admin */}
            <header className={styles.header}>
                <div className={`container ${styles.headerInner}`}>
                    <div className={styles.brand}>
                        <span className={styles.logoMark} aria-hidden="true">JV</span>
                        <div>
                            <p className={styles.brandName}>JVSoftware</p>
                            <p className={styles.brandSub}>Panel de administración</p>
                        </div>
                    </div>
                    <UserButton afterSignOutUrl="/" />
                </div>
            </header>

            {/* Navegación de tabs */}
            <nav className={styles.tabs} aria-label="Secciones del admin">
                <div className="container">
                    <div className={styles.tabList} role="tablist">
                        {TABS.map(({ id, label }) => (
                            <button
                                key={id}
                                role="tab"
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

            {/* Contenido */}
            <main className={styles.content}>
                <div className="container">

                    <div
                        id="panel-leads"
                        role="tabpanel"
                        aria-labelledby="tab-leads"
                        hidden={activeTab !== 'leads'}
                    >
                        {activeTab === 'leads' && <LeadsTable />}
                    </div>

                    <div
                        id="panel-portfolio"
                        role="tabpanel"
                        aria-labelledby="tab-portfolio"
                        hidden={activeTab !== 'portfolio'}
                    >
                        {activeTab === 'portfolio' && <ProjectForm />}
                    </div>

                </div>
            </main>

        </div>
    );
}