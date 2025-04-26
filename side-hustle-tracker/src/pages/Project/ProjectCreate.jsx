import AddProject from '../../components/AddTableRow/AddProject';

export default function ProjectCreate() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Neues Projekt anlegen</h1>
      <AddProject />
    </div>
  );
}