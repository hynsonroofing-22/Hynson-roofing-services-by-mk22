import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import useScrollLock from "../hooks/useScrollLock";

export default function Modal({ open, onClose, children, maxWidthClass = "max-w-4xl" }) {
  // Background lock lives in the shared hook now, so all three overlays on the
  // site behave identically. It still does both halves — body overflow AND
  // stopping Lenis — which is the part that must never be dropped.
  useScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          // items-start + my-auto on the panel, NOT items-center: with
          // `items-center` a panel taller than the screen is centred on
          // overflow, which clips its top off and makes it unreachable — you
          // cannot scroll up past the start of a flex container. With
          // items-start the panel still sits centred when it fits, and starts
          // from the top when it doesn't.
          className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto overscroll-contain bg-black/70 p-4 py-10 sm:p-6"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          // Lenis calls preventDefault() on every wheel event while it is
          // stopped, which is exactly what the scroll lock does — so without
          // this the overlay's own content cannot scroll either. Lenis skips
          // any element carrying this attribute.
          data-lenis-prevent
          data-testid="site-modal"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent
            className={`relative my-auto w-full ${maxWidthClass} max-h-[90vh] overflow-y-auto overscroll-contain border border-ink-700/40 bg-ink-950 shadow-xl`}
          >
            <button
              onClick={onClose}
              className="btn-lift sticky top-4 z-10 ml-auto mr-4 flex h-9 w-9 items-center justify-center border border-ink-700/50 bg-ink-900 text-zinc-300 hover:border-brand hover:text-brand"
              aria-label="Close"
              data-testid="site-modal-close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="-mt-9">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
