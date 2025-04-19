import ThemeToggle from "../components/Visuals/ThemeToggle"
import TransactionListAllProjects from "../components/Transactions/TransactionListAllProjects"

export default function Transaction() {

    return(
        <div className="max-w-4xl mx-auto p-6 text-gray-900 dark:text-gray-100">
            <ThemeToggle />
              <h1 className="text-2xl font-bold mb-6">📁 Alle Transaktionen</h1>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <TransactionListAllProjects limit={500} scrollable={false} />
              </div>
            </div>
    )
}