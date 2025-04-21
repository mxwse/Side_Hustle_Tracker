import { useState } from "react";


export default function InvoiceForm({ onGenerate, project_id }) {
  const [form, setForm] = useState({
    from: { name: "", address: "", phone: "", fax: "" },
    to: { name: "", company: "", address: "", phone: "" },
    invoice: {
      number: "",
      date: new Date().toISOString().split("T")[0],
      comment: "",
    },
    tax: 19,
    shipping: 0,
  });
  const [items, setItems] = useState([{ qty: 1, description: "", price: 0 }]);

  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === "qty" || field === "price" ? Number(value) : value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { qty: 1, description: "", price: 0 }]);

  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitting) return; // schützt vor Doppeleinreichung
    setSubmitting(true);
  
    onGenerate({ ...form, items, project_id });
  
    setSuccess(true);
  
    setTimeout(() => {window.location.reload();}, 2000);
  };

  const inputStyle =
    "w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">📦 Absender</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input placeholder="Firmenname" className={inputStyle} value={form.from.name}
            onChange={(e) => setForm({ ...form, from: { ...form.from, name: e.target.value } })} />
          <input placeholder="Adresse" className={inputStyle} value={form.from.address}
            onChange={(e) => setForm({ ...form, from: { ...form.from, address: e.target.value } })} />
          <input placeholder="Telefon" className={inputStyle} value={form.from.phone}
            onChange={(e) => setForm({ ...form, from: { ...form.from, phone: e.target.value } })} />
          <input placeholder="Fax (optional)" className={inputStyle} value={form.from.fax}
            onChange={(e) => setForm({ ...form, from: { ...form.from, fax: e.target.value } })} />
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">👤 Empfänger</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input placeholder="Name" className={inputStyle} value={form.to.name}
            onChange={(e) => setForm({ ...form, to: { ...form.to, name: e.target.value } })} />
          <input placeholder="Firma (optional)" className={inputStyle} value={form.to.company}
            onChange={(e) => setForm({ ...form, to: { ...form.to, company: e.target.value } })} />
          <input placeholder="Adresse" className={inputStyle} value={form.to.address}
            onChange={(e) => setForm({ ...form, to: { ...form.to, address: e.target.value } })} />
          <input placeholder="Telefon" className={inputStyle} value={form.to.phone}
            onChange={(e) => setForm({ ...form, to: { ...form.to, phone: e.target.value } })} />
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">📄 Rechnung</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input placeholder="Rechnungsnummer" className={inputStyle} value={form.invoice.number}
            onChange={(e) => setForm({ ...form, invoice: { ...form.invoice, number: e.target.value } })} />
          <input type="date" className={inputStyle} value={form.invoice.date}
            onChange={(e) => setForm({ ...form, invoice: { ...form.invoice, date: e.target.value } })} />
        </div>
        <textarea placeholder="Kommentar (optional)" rows={3} className={`${inputStyle} mt-4`}
          value={form.invoice.comment}
          onChange={(e) => setForm({ ...form, invoice: { ...form.invoice, comment: e.target.value } })} />
      </section>

      <section className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">🧾 Positionen</h2>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
              <input type="number" className={inputStyle} placeholder="Menge" min={1}
                value={item.qty} onChange={(e) => updateItem(index, "qty", e.target.value)} />
              <input type="text" className="col-span-2 md:col-span-3 p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Beschreibung"
                value={item.description}
                onChange={(e) => updateItem(index, "description", e.target.value)} />
              <input type="number" className={inputStyle} placeholder="Preis" step="0.01"
                value={item.price} onChange={(e) => updateItem(index, "price", e.target.value)} />
              <button type="button" onClick={() => removeItem(index)} className="text-red-500">✕</button>
            </div>
          ))}
          <button type="button" onClick={addItem} className="text-blue-600 hover:underline">
            + Weitere Position
          </button>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">💰 Zusatzkosten</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">MwSt. (%)</label>
            <input type="number" className={inputStyle} value={form.tax}
              onChange={(e) => setForm({ ...form, tax: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Versand (€)</label>
            <input type="number" className={inputStyle} value={form.shipping}
              onChange={(e) => setForm({ ...form, shipping: Number(e.target.value) })} />
          </div>
        </div>
      </section>

      <div className="text-right">
        <button
          type="submit"
          disabled={submitting}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded shadow disabled:opacity-50"
        >
          📄 PDF generieren
        </button>

        {success && (
          <p className="text-green-600 text-sm mt-2 animate-fade-in">
            ✅ Rechnung erfolgreich erstellt!
          </p>
        )}
      </div>
    </form>
  );
}
