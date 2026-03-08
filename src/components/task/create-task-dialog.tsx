"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateTaskForm } from "./create-task-form";

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        タスクを登録する
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>タスクを登録する</DialogTitle>
        </DialogHeader>
        <CreateTaskForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
