import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import InvoicePreview from "./InvoicePreview";

export default function InvoiceForm({ onGenerate, project_id, teamId }) {
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

  const inputStyle = "w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white";

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (!teamId) return;
      const { data, error } = await supabase
        .from("company_details")
        .select("*")
        .eq("team_id", teamId)
        .maybeSingle();
      if (error) {
        console.error("❌ Fehler beim Laden der Absenderdaten:", error.message);
        return;
      }
      if (data) {
        setForm((prev) => ({
          ...prev,
          from: {
            name: data.name || "",
            address: data.address || "",
            phone: data.phone || "",
            fax: data.fax || "",
          },
        }));
      }
    };

    fetchCompanyDetails();
  }, [teamId]);

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === "qty" || field === "price" ? Number(value) : value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { qty: 1, description: "", price: 0 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    if (typeof onGenerate === "function") {
      await onGenerate({
        from: form.from,
        to: form.to,
        invoice: form.invoice,
        tax: form.tax,
        shipping: form.shipping,
        items,
        project_id,
        teamId,
      });
      setSuccess(true);
    } else {
      console.error("❌ Kein gültiges onGenerate übergeben!");
    }

    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Absender */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Absender</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["name", "address"].map((field) => (
            <input
              key={field}
              type="text"
              placeholder={field.charAt(0).toUpperCase() + field.slice(1) + "*"}
              value={form.from[field]}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  from: { ...prev.from, [field]: e.target.value },
                }))
              }
              className={inputStyle}
            />
          ))}
          {["phone", "fax"].map((field) => (
            <input
              key={field}
              type="text"
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={form.from[field]}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  from: { ...prev.from, [field]: e.target.value },
                }))
              }
              className={inputStyle}
            />
          ))}
        </div>
      </section>

      {/* Empfänger */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Empfänger</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["name", "address"].map((field) => (
            <input
              key={field}
              type="text"
              placeholder={field.charAt(0).toUpperCase() + field.slice(1) + "*"}
              value={form.to[field]}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  to: { ...prev.to, [field]: e.target.value },
                }))
              }
              className={inputStyle}
            />
          ))}
          {["company", "phone"].map((field) => (
            <input
              key={field}
              type="text"
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={form.to[field]}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  to: { ...prev.to, [field]: e.target.value },
                }))
              }
              className={inputStyle}
            />
          ))}
        </div>
      </section>

      {/* Rechnung */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Rechnung</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Rechnungsnummer"
            className={inputStyle}
            value={form.invoice.number}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                invoice: { ...prev.invoice, number: e.target.value },
              }))
            }
          />
          <input
            type="date"
            className={inputStyle}
            value={form.invoice.date}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                invoice: { ...prev.invoice, date: e.target.value },
              }))
            }
          />
        </div>
        <textarea
          placeholder="Kommentar (optional)"
          rows={3}
          className={`${inputStyle} mt-4`}
          value={form.invoice.comment}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              invoice: { ...prev.invoice, comment: e.target.value },
            }))
          }
        />
      </section>

      {/* Positionen */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Positionen</h2>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
              <input
                type="number"
                className={inputStyle}
                placeholder="Menge"
                min={1}
                value={item.qty}
                onChange={(e) => updateItem(index, "qty", e.target.value)}
              />
              <input
                type="text"
                className="col-span-2 md:col-span-3 p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Beschreibung"
                value={item.description}
                onChange={(e) => updateItem(index, "description", e.target.value)}
              />
              <input
                type="number"
                className={inputStyle}
                placeholder="Preis"
                step="0.01"
                value={item.price}
                onChange={(e) => updateItem(index, "price", e.target.value)}
              />
              <button type="button" onClick={() => removeItem(index)} className="text-red-500">
                ✕
              </button>
            </div>
          ))}
          <button type="button" onClick={addItem} className="text-blue-600 hover:underline">
            + Weitere Position
          </button>
        </div>
      </section>

      {/* Zusatzkosten */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Zusatzkosten</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">MwSt. (%)</label>
            <input
              type="number"
              className={inputStyle}
              value={form.tax}
              onChange={(e) => setForm((prev) => ({ ...prev, tax: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Versand (€)</label>
            <input
              type="number"
              className={inputStyle}
              value={form.shipping}
              onChange={(e) => setForm((prev) => ({ ...prev, shipping: Number(e.target.value) }))}
            />
          </div>
        </div>
      </section>
      <p className="text-xs font-light">Alle mit "*" markierten Felder, sind Pflichtfelder</p>
      {/* Vorschau */}
      <InvoicePreview form={form} items={items} />

      {/* Submit */}
      <div className="text-right">
        <button
          type="submit"
          disabled={submitting}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded shadow disabled:opacity-50"
        >
          📄 Rechnung erstellen
        </button>
        {success && (
          <p className="text-green-500 mt-4">Rechnung erfolgreich erstellt!</p>
        )}
      </div>
    </form>
  );
}
