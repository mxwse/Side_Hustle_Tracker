import React from "react";

export default function InvoicePreview({ form, items }) {
  const calculateTotal = () => {
    const net = items.reduce((sum, item) => sum + item.qty * item.price, 0);
    const taxAmount = (net * form.tax) / 100;
    const total = net + taxAmount + form.shipping;
    return total;
  };

  const totalAmount = calculateTotal();

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold text-center text-gray-800 ">Rechnung</h2>
      <div className="space-y-4 mt-4 text-gray-800">
        {/* Absender */}
        <div className="flex justify-between">
          <div className="w-1/2">
            <h3 className="text-lg font-semibold">Absender</h3>
            <p>{form.from.name}</p>
            <p>{form.from.address}</p>
            <p>{form.from.phone}</p>
            {form.from.fax && <p>Fax: {form.from.fax}</p>}
          </div>

          {/* Empfänger */}
          <div className="w-1/2 text-right ">
            <h3 className="text-lg font-semibold">Empfänger</h3>
            <p>{form.to.name}</p>
            {form.to.company && <p>{form.to.company}</p>}
            <p>{form.to.address}</p>
            {form.to.phone && <p>Tel: {form.to.phone}</p>}
          </div>
        </div>

        <div className="flex justify-between mt-4">
          {/* Rechnungsnummer und Datum */}
          <div className="w-1/2">
            <p>Rechnungsnummer: {form.invoice.number}</p>
            <p>Datum: {form.invoice.date}</p>
            {form.invoice.comment && <p>Kommentar: {form.invoice.comment}</p>}
          </div>

          {/* Steuer und Versand */}
          <div className="w-1/2 text-right">
            <p>Steuer: {form.tax}%</p>
            <p>Versand: {form.shipping} €</p>
          </div>
        </div>

        {/* Positionen */}
        <table className="w-full table-auto mt-4">
          <thead>
            <tr>
              <th className="border-b py-2">Menge</th>
              <th className="border-b py-2">Beschreibung</th>
              <th className="border-b py-2">Einzelpreis</th>
              <th className="border-b py-2">Gesamt</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td className="border-b py-2">{item.qty}</td>
                <td className="border-b py-2">{item.description}</td>
                <td className="border-b py-2">{item.price.toFixed(2)} €</td>
                <td className="border-b py-2">{(item.qty * item.price).toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Gesamtbetrag */}
        <div className="flex justify-between mt-4">
          <div className="w-1/2">
            <h3 className="text-lg font-semibold">Gesamtbetrag</h3>
          </div>
          <div className="w-1/2 text-right">
            <p className="text-xl font-bold">{totalAmount.toFixed(2)} €</p>
          </div>
        </div>
      </div>
    </div>
  );
}
