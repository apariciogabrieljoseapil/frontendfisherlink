// Shared shell for every modal. Returns nothing when closed, so each modal's
// inner state resets automatically on close (same as the old close*Modal() functions).
export default function Modal({ open, id, title, onClose, className = '', contentClass = '', children }) {
  if (!open) return null;
  return (
    <div id={id} className={`modal ${className}`} style={{ display: 'flex' }}>
      <div className={`modal-content ${contentClass}`}>
        <div className="close-div">
          <div className="title-modal">
            <div className="title">{title}</div>
            <img src="/assets/logos/logo-2.png" alt="logo" width="70" height="auto" className="logo" />
          </div>
          <span className="close-modal" onClick={onClose}>
            <img src="/assets/icons/delete.png" alt="Close" width="24" />
          </span>
        </div>
        <div className="line" />
        {children}
      </div>
    </div>
  );
}
