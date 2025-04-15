import ChatsList from "../components/ChatsList";
import CreateChat from "../components/CreateChat";

export default function Chats() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">💬 Deine Chats</h1>

      <CreateChat />

      <hr className="border-gray-300 dark:border-gray-700" />

      <ChatsList />
    </div>
  );
}
