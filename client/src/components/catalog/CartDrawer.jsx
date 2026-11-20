import { useEffect, useRef } from "react";

export default function CartDrawer({ cart, cartTotal, changeQuantity, removeFromCart, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  return (
    <dialog ref={dialog} className="cart-dialog" aria-label="Shopping cart" onCancel={onClose}
      onClick={(e) => { if (e.target === dialog.current) onClose(); }}>
      <div className="cart-panel">
        <div className="cart-header">
              <h2>Your cart</h2>
              <button aria-label="Close cart" onClick={onClose}>×</button>
            </div>

            {cart.length === 0 ? (
              <p className="empty-message">
                Your cart is empty.
              </p>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item._id}>
                      <div>
                        <h3>{item.title}</h3>
                        <p>₹{item.price} each</p>

                        <div className="quantity-controls">
                          <button
                            onClick={() => changeQuantity(item._id, -1)}
                          >
                            −
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            onClick={() => changeQuantity(item._id, 1)}
                          >
                            +
                          </button>

                          <button
                            className="remove-button"
                            onClick={() => removeFromCart(item._id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <strong>
                        ₹{item.price * item.quantity}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="cart-total">
                  <span>Subtotal</span>
                  <strong>₹{cartTotal.toFixed(2)}</strong>
                </div>
              </>
            )}
      </div>
    </dialog>
  );
}
