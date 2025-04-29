import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useEffect, useState, useCallback } from "react";
import ThemeToggle from "../../components/Visuals/ThemeToggle";
import TransactionList from "../../components/Transactions/TransactionList";
import CommentList from "../../components/Comment/CommentList";
import AddComment from "../../components/AddTableRow/AddComment";
import AddEntry from "../../components/AddTableRow/AddEntry";
import ProfitChart from "../../components/Transactions/ProfitChart";
import IncomeOverview from "../../components/Transactions/IncomeOverview";
import ProjectDetails from "../../components/Project/ProjectDetails";
import Todos from "../../components/ToDo/ToDoList";
import InvoiceList from "../../components/Invoice/InvoiceList";
import InvoiceForm from "../../components/Invoice/InvoiceForm";
import AddToDo from "../../components/AddTableRow/AddToDo";
import { generateInvoicePDF } from "../../components/Invoice/InvoicePDFGenerator";


export default function ProjectDetail() {
  const { id: projectId } = useParams();
  const [project, setProject] = useState(null);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*, profiles(id, username, email)")
        .eq("id", projectId)
        .single();

      if (!error) setProject(data);
    };

    fetchProject();
  }, [projectId]);

  const loadTodos = useCallback(async () => {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (!error) setTodos(data);
    else console.error("Fehler beim Laden der ToDos:", error.message);
  }, [projectId]);

  useEffect(() => {
    if (projectId) loadTodos();
  }, [projectId, loadTodos]);

  const tabs = [
    { key: "overview", label: "Übersicht" },
    { key: "entries", label: "Buchungen" },
    { key: "comments", label: "Kommentare" },
    { key: "notes", label: "To Do's" },
    { key: "details", label: "Details" },
    { key: "invoices", label: "Rechnungen" },
  ];

  if (!project) return <p className="p-6">Projekt wird geladen...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <ThemeToggle />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {project.name}
      </h1>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`px-4 py-2 font-medium rounded-t transition-colors duration-200 ${
                selectedTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:text-blue-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === "overview" && (
        <div>
          <IncomeOverview />
          <ProfitChart />
          <br />
          <Todos projectId={projectId} todos={todos} active={true} onUpdated={loadTodos} />
        </div>
      )}

      {selectedTab === "entries" && (
        <div className="space-y-4">
          <AddEntry />
          <TransactionList limit={9} scrollable={false} project={projectId} />
        </div>
      )}

      {selectedTab === "comments" && (
        <div className="space-y-4">
          <AddComment projectId={projectId} />
          <CommentList projectId={projectId} />
        </div>
      )}

      {selectedTab === "notes" && (
        <div>
          <AddToDo projectId={projectId} onTodoAdded={loadTodos} />
          <Todos projectId={projectId} todos={todos} active={true} onUpdated={loadTodos} />
          <br />
          <Todos projectId={projectId} todos={todos} active={false} onUpdated={loadTodos} />
        </div>
      )}

      {selectedTab === "details" && (
        <div>
          <ProjectDetails projectId={projectId} />
        </div>
      )}

      {selectedTab === "invoices" && (
        <div>
          <InvoiceForm
            project_id={projectId}
            teamId={project.team_id}
            onGenerate={generateInvoicePDF}
          />
          <br />
          <InvoiceList projectId={projectId} />
        </div>
      )}
    </div>
  );
}
