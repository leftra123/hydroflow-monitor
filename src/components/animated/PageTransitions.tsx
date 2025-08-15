/**
 * 🎬 Transiciones de Página y Layout
 * 
 * Componentes especializados para transiciones fluidas entre diferentes
 * vistas y estados de la aplicación. Proporciona continuidad visual
 * y mejora la percepción de performance.
 * 
 * Características:
 * - Transiciones de página con shared layout
 * - Animaciones de cambio de pestañas
 * - Transiciones contextuales basadas en estado
 * - Efectos de parallax y profundidad
 * - Optimización de performance con AnimatePresence
 */

import React from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useUIState } from '@/store/useHydrologyStore';

// 🎭 Variantes para transiciones de página
const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    y: 20
  },
  in: {
    opacity: 1,
    scale: 1,
    y: 0
  },
  out: {
    opacity: 0,
    scale: 1.02,
    y: -20
  }
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'anticipate' as const,
  duration: 0.4
};

// 🎯 Contenedor de Transición de Página
interface PageTransitionProps {
  children: React.ReactNode;
  pageKey: string;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  pageKey,
  className = ''
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// 📑 Transición de Pestañas
interface TabTransitionProps {
  children: React.ReactNode;
  activeTab: string;
  className?: string;
}

export const TabTransition: React.FC<TabTransitionProps> = ({
  children,
  activeTab,
  className = ''
}) => {
  const tabVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// 🎨 Indicador de Pestaña Activa
interface TabIndicatorProps {
  tabs: Array<{ id: string; label: string }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const AnimatedTabIndicator: React.FC<TabIndicatorProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}) => {
  return (
    <div className={`flex space-x-1 bg-gray-100 p-1 rounded-lg ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            relative px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200
            ${activeTab === tab.id 
              ? 'text-blue-700' 
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white shadow-sm rounded-md"
              initial={false}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

// 🌊 Efecto de Onda (Ripple)
interface RippleEffectProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const RippleEffect: React.FC<RippleEffectProps> = ({
  children,
  className = '',
  onClick
}) => {
  const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    // Remover el ripple después de la animación
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
    
    onClick?.();
  };

  return (
    <div
      className={`relative overflow-hidden cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {children}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
            }}
            initial={{
              width: 0,
              height: 0,
              x: 0,
              y: 0,
              opacity: 1
            }}
            animate={{
              width: 300,
              height: 300,
              x: -150,
              y: -150,
              opacity: 0
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// 🎪 Contenedor de Layout Compartido
interface SharedLayoutProps {
  children: React.ReactNode;
}

export const SharedLayout: React.FC<SharedLayoutProps> = ({ children }) => {
  return (
    <LayoutGroup>
      {children}
    </LayoutGroup>
  );
};

// 🎯 Modal Animado
interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const AnimatedModal: React.FC<AnimatedModalProps> = ({
  isOpen,
  onClose,
  children,
  title
}) => {
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {title && (
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            )}
            
            <div className="p-6 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 🎢 Efecto Parallax
interface ParallaxProps {
  children: React.ReactNode;
  offset?: number;
  className?: string;
}

export const ParallaxEffect: React.FC<ParallaxProps> = ({
  children,
  offset = 50,
  className = ''
}) => {
  const [scrollY, setScrollY] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      className={className}
      style={{
        y: scrollY * (offset / 100)
      }}
    >
      {children}
    </motion.div>
  );
};

// 🎭 Transición de Estado de Conexión
interface ConnectionStatusTransitionProps {
  isConnected: boolean;
  children: React.ReactNode;
}

export const ConnectionStatusTransition: React.FC<ConnectionStatusTransitionProps> = ({
  isConnected,
  children
}) => {
  const variants = {
    connected: {
      opacity: 1,
      scale: 1,
      filter: 'grayscale(0%)',
      transition: { duration: 0.3 }
    },
    disconnected: {
      opacity: 0.7,
      scale: 0.98,
      filter: 'grayscale(50%)',
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      variants={variants}
      animate={isConnected ? 'connected' : 'disconnected'}
    >
      {children}
      
      {/* Overlay de desconexión */}
      <AnimatePresence>
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/20 backdrop-blur-[1px] flex items-center justify-center rounded-lg"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white px-4 py-2 rounded-lg shadow-lg"
            >
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full"
                />
                <span>Reconectando...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
