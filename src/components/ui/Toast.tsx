import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { cn } from "../../lib/utils";

interface ToastProps {
  isVisible: boolean;
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

export function Toast({ isVisible, message, type = "success", onClose }: ToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md",
            type === "success" 
              ? "bg-white/90 border-emerald-100 text-emerald-900" 
              : "bg-white/90 border-red-100 text-red-900"
          )}>
            {type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <p className="text-sm font-medium mr-2">{message}</p>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-black/5 transition-colors"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
