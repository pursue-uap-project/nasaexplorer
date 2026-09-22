"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Transicion entre rutas. El desplazamiento de 10 px y el fundido se anulan
 * cuando el sistema pide menos movimiento: era la unica animacion del portal
 * que no lo miraba, y a diferencia de las decorativas (starfield, Ken Burns,
 * el simulador solar, que ya se paran) esta se dispara en CADA navegacion,
 * asi que es justo la que mas molesta a quien activa ese ajuste.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative flex flex-col flex-1">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
        className="flex flex-col flex-1"
      >
        {children}
      </motion.div>
    </div>
  );
}
