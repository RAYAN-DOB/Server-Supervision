import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

/**
 * Hook pour les raccourcis clavier globaux
 */
export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignorer si on tape dans un input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + K : Recherche rapide
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        toast.info('🔍 Recherche rapide', { description: 'Fonctionnalité à venir' });
      }

      // G puis D : Dashboard
      if (event.key === 'g') {
        const handleSecondKey = (e: KeyboardEvent) => {
          if (e.key === 'd') {
            router.push('/dashboard');
            toast.success('📊 Dashboard');
          } else if (e.key === 's') {
            router.push('/sites');
            toast.success('🏢 Sites');
          } else if (e.key === 'a') {
            router.push('/alertes');
            toast.success('🚨 Alertes');
          } else if (e.key === 'h') {
            router.push('/historique');
            toast.success('📜 Historique');
          } else if (e.key === 'm') {
            router.push('/carte');
            toast.success('🗺️ Carte');
          }
          window.removeEventListener('keydown', handleSecondKey);
        };
        
        window.addEventListener('keydown', handleSecondKey);
        setTimeout(() => window.removeEventListener('keydown', handleSecondKey), 2000);
      }

      // ? : Afficher l'aide des raccourcis
      if (event.key === '?' && event.shiftKey) {
        event.preventDefault();
        toast.info('⌨️ Raccourcis Clavier', {
          description: 'G+D: Dashboard | G+S: Sites | G+A: Alertes | G+H: Historique | G+M: Carte',
          duration: 5000,
        });
      }

      // Escape : Fermer les modales/chatbot
      if (event.key === 'Escape') {
        // Dispatch custom event pour fermer le chatbot
        window.dispatchEvent(new CustomEvent('close-chatbot'));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [router]);
}
