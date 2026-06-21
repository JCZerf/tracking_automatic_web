type ConfirmationModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <section className="modal-card">
        <div>
          <p className="eyebrow">Confirmação</p>
          <h2>{title}</h2>
        </div>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button type="button" className="modal-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="modal-confirm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
