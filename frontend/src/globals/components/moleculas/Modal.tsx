import { MouseEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    onClose(): void;
    children: ReactNode;
    title?: string;
}

const Modal = ({ onClose, children, title }: ModalProps) => {
    const handleCloseClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        onClose();
    };

    const modalRoot = typeof document !== 'undefined' ? document.getElementById("modal-root") : null;

    if (!modalRoot) {
        return null;
    }

    const modalContent = (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black/50 items-center z-10">
            <div className="w-2/5 h-4/5">
                <div className="bg-white max-h-full w-full rounded-md p-6 flex flex-col">
                    <div className="flex justify-between text-lg pb-4">
                        {title && <h1 className="text-2xl font-bold text-accent text-center justify-self-center self-center">{title}</h1>}
                        <button
                            type="button"
                            onClick={handleCloseClick}
                            className="text-lg font-bold text-gris-oscuro justify-self-end self-center"
                            aria-label="Cerrar modal"
                        >
                            ×
                        </button>
                    </div>
                    <div className="pt-3 overflow-y-auto">{children}</div>
                </div>
            </div>
        </div>
    );

    return createPortal(
        modalContent,
        modalRoot
    );
};

export default Modal;