import { useState } from "react";

export default function InvoiceForm({ onGenerate }) {
  const [form, setForm] = useState({
    from: {
      name: "",
      address: "",
      phone: "",
      fax: "",
    },
    to: {
      name: "",
      company: "",
      address: "",
      phone: "",
    },
    invoice: {
      number: "",
      date: new Date().toISOString().split("T")[0],
      comment: "",
    },
    tax: 19,
    shipping: 0,
  });

  const [items, setItems] = useState([
    { qty: 1, description: "", price: 0 },
  ]);

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === "qty" || field === "price" ? Number(value) : value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { qty: 1, description: "", price: 0 }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate({ ...form, items });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">📋 Rechnung erstellen</h2>

      {/* Absender */}
      <fieldset className="space-y-2">
        <legend className="font-semibold">Absender</legend>
        <input type="text" placeholder="Firmenname" value={form.from.name} onChange={(e) => setForm({ ...form, from: { ...form.from, name: e.target.value } })} />
        <input type="text" placeholder="Adresse" value={form.from.address} onChange={(e) => setForm({ ...form, from: { ...form.from, address: e.target.value } })} />
        <input type="text" placeholder="Telefon" value={form.from.phone} onChange={(e) => setForm({ ...form, from: { ...form.from, phone: e.target.value } })} />
        <input type="text" placeholder="Fax" value={form.from.fax} onChange={(e) => setForm({ ...form, from: { ...form.from, fax: e.target.value } })} />
      </fieldset>

      {/* Empfänger */}
      <fieldset className="space-y-2">
        <legend className="font-semibold">Empfänger</legend>
        <input type="text" placeholder="Name" value={form.to.name} onChange={(e) => setForm({ ...form, to: { ...form.to, name: e.target.value } })} />
        <input type="text" placeholder="Firma" value={form.to.company} onChange={(e) => setForm({ ...form, to: { ...form.to, company: e.target.value } })} />
        <input type="text" placeholder="Adresse" value={form.to.address} onChange={(e) => setForm({ ...form, to: { ...form.to, address: e.target.value } })} />
        <input type="text" placeholder="Telefon" value={form.to.phone} onChange={(e) => setForm({ ...form, to: { ...form.to, phone: e.target.value } })} />
      </fieldset>

      {/* Rechnungsdaten */}
      <fieldset className="space-y-2">
        <legend className="font-semibold">Rechnung</legend>
        <input type="text" placeholder="Rechnungsnummer" value={form.invoice.number} onChange={(e) => setForm({ ...form, invoice: { ...form.invoice, number: e.target.value } })} />
        <input type="date" value={form.invoice.date} onChange={(e) => setForm({ ...form, invoice: { ...form.invoice, date: e.target.value } })} />
        <textarea placeholder="Kommentar" value={form.invoice.comment} onChange={(e) => setForm({ ...form, invoice: { ...form.invoice, comment: e.target.value } })} />
      </fieldset>

      {/* Positionen */}
      <fieldset className="space-y-4">
        <legend className="font-semibold">Positionen</legend>
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              type="number"
              value={item.qty}
              onChange={(e) => updateItem(index, "qty", e.target.value)}
              className="w-16"
              placeholder="Menge"
              min={1}
            />
            <input
              type="text"
              value={item.description}
              onChange={(e) => updateItem(index, "description", e.target.value)}
              className="flex-grow"
              placeholder="Beschreibung"
            />
            <input
              type="number"
              value={item.price}
              onChange={(e) => updateItem(index, "price", e.target.value)}
              className="w-24"
              placeholder="Preis"
              step="0.01"
            />
            <button type="button" onClick={() => removeItem(index)} className="text-red-500">✕</button>
          </div>
        ))}
        <button type="button" onClick={addItem} className="text-blue-600 hover:underline">+ Position hinzufügen</button>
      </fieldset>

      {/* Steuer und Versand */}
      <div className="flex gap-4">
        <div>
          <label className="block text-sm">MwSt. (%)</label>
          <input type="number" value={form.tax} onChange={(e) => setForm({ ...form, tax: Number(e.target.value) })} />
        </div>
        <div>
          <label className="block text-sm">Versand (€)</label>
          <input type="number" value={form.shipping} onChange={(e) => setForm({ ...form, shipping: Number(e.target.value) })} />
        </div>
      </div>

      <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
        📄 PDF generieren
      </button>
    </form>
  );
}