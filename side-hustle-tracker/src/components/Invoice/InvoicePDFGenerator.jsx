import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { supabase } from "../../lib/supabaseClient";
import getNextInvoiceNumber from "./GenerateInvoiceNumber";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 10,
  },
  header: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 20,
    marginTop: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  tableCell: {
    width: "25%",
    textAlign: "center",
    fontSize: 12,
  },
  total: {
    fontSize: 14,
    marginTop: 10,
    fontWeight: "bold",
  },
  totalText: {
    textAlign: "right",
  },
  alignRight: {
    textAlign: "right",
  },
  flexRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    width: "48%",
  },
});

// Hauptfunktion
export async function generateInvoicePDF(invoiceData) {
  if (!invoiceData?.from?.name || !invoiceData?.from?.address || !invoiceData?.to?.name || !invoiceData?.to?.address || !Array.isArray(invoiceData?.items)) {
    alert("Bitte fülle alle erforderlichen Felder aus.");
    return;
  }

  try {
    const net = invoiceData.items.reduce((sum, item) => sum + item.qty * item.price, 0);
    const taxAmount = (net * invoiceData.tax) / 100;
    const total = net + taxAmount + invoiceData.shipping;
    const InvoiceNumber = await getNextInvoiceNumber();

    const doc = (
      <Document>
        <Page style={styles.page}>
          <Text style={styles.title}>Rechnung</Text>
    
          {/* Absender und Empfänger in zwei Spalten */}
          <View style={styles.flexRow}>
            <View style={styles.column}>
              <Text style={styles.header}>Absender</Text>
              <Text style={styles.text}>{invoiceData.from.name}</Text>
              <Text style={styles.text}>{invoiceData.from.address}</Text>
              <Text style={styles.text}>{`Tel: ${invoiceData.from.phone}`}</Text>
              {invoiceData.from.fax && <Text style={styles.text}>{`Fax: ${invoiceData.from.fax}`}</Text>}
            </View>
            <View style={styles.column}>
              <Text style={styles.header}>Empfänger</Text>
              <Text style={styles.text}>{invoiceData.to.name}</Text>
              {invoiceData.to.company && <Text style={styles.text}>{invoiceData.to.company}</Text>}
              <Text style={styles.text}>{invoiceData.to.address}</Text>
              {invoiceData.to.phone && <Text style={styles.text}>{`Tel: ${invoiceData.to.phone}`}</Text>}
            </View>
          </View>
    
          {/* Rechnungsdetails */}
          <View style={styles.section}>
            <Text style={styles.header}>Rechnungsnummer: {InvoiceNumber}</Text>
            <Text style={styles.text}>Datum: {invoiceData.invoice.date}</Text>
            {invoiceData.invoice.comment && (
              <Text style={styles.text}>Kommentar: {invoiceData.invoice.comment}</Text>
            )}
          </View>
    
          {/* Tabelle mit Positionen */}
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Menge</Text>
              <Text style={styles.tableCell}>Beschreibung</Text>
              <Text style={styles.tableCell}>Einzelpreis</Text>
              <Text style={styles.tableCell}>Gesamt</Text>
            </View>
            {invoiceData.items.map((item, index) => (
              <View style={styles.tableRow} key={index}>
                <Text style={styles.tableCell}>{item.qty}</Text>
                <Text style={styles.tableCell}>{item.description}</Text>
                <Text style={styles.tableCell}>{item.price.toFixed(2)} €</Text>
                <Text style={styles.tableCell}>{(item.qty * item.price).toFixed(2)} €</Text>
              </View>
            ))}
          </View>
    
          {/* Zusammenfassung */}
          <View style={styles.section}>
            <View style={styles.flexRow}>
              <Text style={styles.total}>Zwischensumme:</Text>
              <Text style={[styles.total, styles.alignRight]}>{net.toFixed(2)} €</Text>
            </View>
            <View style={styles.flexRow}>
              <Text style={styles.total}>MwSt. ({invoiceData.tax}%):</Text>
              <Text style={[styles.total, styles.alignRight]}>{taxAmount.toFixed(2)} €</Text>
            </View>
            <View style={styles.flexRow}>
              <Text style={styles.total}>Versand:</Text>
              <Text style={[styles.total, styles.alignRight]}>{invoiceData.shipping.toFixed(2)} €</Text>
            </View>
            <View style={styles.flexRow}>
              <Text style={styles.total}>Gesamtbetrag:</Text>
              <Text style={[styles.total, styles.alignRight]}>{total.toFixed(2)} €</Text>
            </View>
          </View>
        </Page>
      </Document>
    );

    // ➡️ Generiere Blob
    const blob = await pdf(doc).toBlob();

    // ➡️ Lokaler Download
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `Rechnung_${InvoiceNumber}.pdf`;
    downloadLink.click();

    // ➡️ Upload zu Supabase
    const fileName = `invoices/Rechnung_${InvoiceNumber}_${Date.now()}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("invoices")
      .upload(fileName, blob, {
        cacheControl: "3600",
        upsert: true,
        contentType: "application/pdf",
      });

    if (uploadError) {
      console.error("❌ Fehler beim Upload zu Supabase:", uploadError.message);
    } else {
      console.log("✅ PDF erfolgreich hochgeladen:", fileName);
    }
  } catch (err) {
    console.error("❌ Fehler beim Generieren der PDF:", err.message);
  }
}
