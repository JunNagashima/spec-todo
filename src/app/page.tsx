import { CreateTaskDialog } from "@/components/task/create-task-dialog";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <CreateTaskDialog />
    </main>
  );
}
