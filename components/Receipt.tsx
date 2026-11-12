import React from 'react';
import { OrderState } from '../types';

interface ReceiptProps {
  order: OrderState;
}

const Receipt: React.FC<ReceiptProps> = ({ order }) => {
  return (
    <div className="bg-white p-6 shadow-xl w-full max-w-md border-t-8 border-red-600 relative overflow-hidden">
      {/* Texture effect */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
      
      <div className="text-center mb-6 border-b-2 border-dashed border-stone-300 pb-4">
        <h2 className="text-3xl text-red-700 font-bold brand-font">Mario's Pizza</h2>
        <p className="text-stone-500 text-sm">123 Columbus St, North Beach, SF</p>
        <p className="text-stone-500 text-sm mt-1">ORDER # {(Math.random() * 1000).toFixed(0).padStart(3, '0')}</p>
      </div>

      <div className="space-y-3 mb-6 min-h-[200px]">
        {order.items.length === 0 ? (
            <p className="text-center text-stone-400 italic py-8">Waiting for order...</p>
        ) : (
            order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-stone-800">
                    <div>
                        <span className="font-bold mr-2">{item.quantity}x</span>
                        <span>{item.pizzaName}</span>
                        <div className="text-xs text-stone-500 uppercase ml-6">{item.size}</div>
                    </div>
                    <div className="font-mono">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
            ))
        )}
      </div>

      <div className="border-t-2 border-dashed border-stone-300 pt-4 space-y-2">
         <div className="flex justify-between text-lg font-bold">
            <span>TOTAL</span>
            <span>${order.total.toFixed(2)}</span>
         </div>
      </div>

      <div className="mt-6 pt-4 border-t border-stone-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
                <p className="text-stone-500">Customer</p>
                <p className="font-medium truncate">{order.customerName || "—"}</p>
            </div>
            <div className="text-right">
                <p className="text-stone-500">Payment</p>
                <p className={`font-medium ${order.paymentMethod ? 'text-green-600' : ''}`}>
                    {order.paymentMethod || "—"}
                </p>
            </div>
        </div>
        <div className="mt-4 text-center">
             <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                 order.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
             }`}>
                {order.status || "Standby"}
             </span>
        </div>
      </div>
    </div>
  );
};

export default Receipt;