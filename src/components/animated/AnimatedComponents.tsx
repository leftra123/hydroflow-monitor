/**
 * ✨ Componentes Animados con Framer Motion
 * 
 * Biblioteca de componentes UI animados que proporcionan micro-interacciones
 * fluidas y transiciones contextuales. Cada componente está diseñado para
 * guiar la atención del usuario y mejorar la experiencia visual.
 * 
 * Características:
 * - Animaciones de entrada y salida suaves
 * - Micro-interacciones en hover y click
 * - Transiciones contextuales basadas en estado
 * - Animaciones de carga y feedback visual
 * - Optimización de performance con layoutId
 */

import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

// 🎭 Variantes de animación reutilizables
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const fadeInScale: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
};

export const slideInFromLeft: Variants = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 }
};

export const slideInFromRight: Variants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 }
};

export const bounceIn: Variants = {
  initial: { opacity: 0, scale: 0.3 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  exit: { opacity: 0, scale: 0.3 }
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// 🎯 Card Animada
interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: 'fadeInUp' | 'fadeInScale' | 'bounceIn';
  whileHover?: boolean;
  layoutId?: string;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  delay = 0,
  variant = 'fadeInUp',
  whileHover = true,
  layoutId
}) => {
  const variants = {
    fadeInUp,
    fadeInScale,
    bounceIn
  };

  return (
    <motion.div
      layoutId={layoutId}
      variants={variants[variant]}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5, delay }}
      whileHover={whileHover ? { 
        scale: 1.02, 
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        transition: { duration: 0.2 }
      } : undefined}
      className={className}
    >
      <Card className="h-full">
        {children}
      </Card>
    </motion.div>
  );
};

// 🏷️ Badge Animado
interface AnimatedBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
  pulse?: boolean;
}

export const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  pulse = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Badge 
        variant={variant} 
        className={`${className} ${pulse ? 'animate-pulse' : ''}`}
      >
        {children}
      </Badge>
    </motion.div>
  );
};

// 🔘 Botón Animado
interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  variant = 'default',
  size = 'default',
  className = '',
  disabled = false,
  loading = false
}) => {
  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={onClick}
        disabled={disabled || loading}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-2"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              />
              <span>Cargando...</span>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  );
};

// 📊 Métrica Animada
interface AnimatedMetricProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
  delay?: number;
}

export const AnimatedMetric: React.FC<AnimatedMetricProps> = ({
  title,
  value,
  icon: Icon,
  trend = 'neutral',
  trendValue,
  color = 'text-blue-500',
  delay = 0
}) => {
  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500'
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      <Card className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2, type: "spring", stiffness: 300 }}
          >
            <Icon className={`h-4 w-4 ${color}`} />
          </motion.div>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="text-2xl font-bold"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.3 }}
          >
            {value}
          </motion.div>
          {trendValue && (
            <motion.div 
              className={`flex items-center text-xs mt-1 ${trendColors[trend]}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.4 }}
            >
              <motion.span
                animate={{ 
                  y: trend === 'up' ? [-1, 1, -1] : trend === 'down' ? [1, -1, 1] : 0 
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
              </motion.span>
              <span className="ml-1">{trendValue}</span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// 🚨 Alerta Animada
interface AnimatedAlertProps {
  children: React.ReactNode;
  type: 'info' | 'warning' | 'error' | 'success';
  onClose?: () => void;
}

export const AnimatedAlert: React.FC<AnimatedAlertProps> = ({
  children,
  type,
  onClose
}) => {
  const colors = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`p-4 rounded-lg border ${colors[type]} relative overflow-hidden`}
    >
      {/* Barra de progreso animada */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 5, ease: "linear" }}
        className="absolute bottom-0 left-0 h-1 bg-current opacity-30"
        onAnimationComplete={onClose}
      />
      
      <div className="flex items-start justify-between">
        <div className="flex-1">{children}</div>
        {onClose && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="ml-4 text-current opacity-70 hover:opacity-100"
          >
            ✕
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// 🔄 Indicador de Carga Animado
interface AnimatedLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const AnimatedLoading: React.FC<AnimatedLoadingProps> = ({
  size = 'md',
  text = 'Cargando...'
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center space-y-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`${sizes[size]} border-4 border-blue-200 border-t-blue-600 rounded-full`}
      />
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-gray-600"
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );
};

// 📈 Gráfico Animado (contenedor)
interface AnimatedChartContainerProps {
  children: React.ReactNode;
  title: string;
  className?: string;
}

export const AnimatedChartContainer: React.FC<AnimatedChartContainerProps> = ({
  children,
  title,
  className = ''
}) => {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className={className}
    >
      <Card>
        <CardHeader>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CardTitle>{title}</CardTitle>
          </motion.div>
        </CardHeader>
        <CardContent>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {children}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// 🎯 Contenedor de Lista Animada
interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  className = ''
}) => {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 📱 Elemento de Lista Animado
interface AnimatedListItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
  children,
  className = '',
  onClick
}) => {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ 
        scale: 1.01,
        backgroundColor: "rgba(0,0,0,0.02)",
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`cursor-pointer rounded-lg p-2 ${className}`}
    >
      {children}
    </motion.div>
  );
};
