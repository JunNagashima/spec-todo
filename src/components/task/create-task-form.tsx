"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTaskSchema, type CreateTaskInput } from "@/schemas/task";
import { createTask } from "@/actions/task";
import { getTodayJST } from "@/lib/date";

interface CreateTaskFormProps {
  onSuccess: () => void;
}

export function CreateTaskForm({ onSuccess }: CreateTaskFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    mode: "onBlur",
    defaultValues: {
      title: "",
      dueDate: "",
      priority: "MIDDLE",
    }
  });

  const onSubmit = async (data: CreateTaskInput) => {
    const result = await createTask(data);
    if (result.success) {
      toast.success("登録完了しました");
      onSuccess();
    } else {
      toast.error("登録に失敗しました");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium">
          タスク名
        </label>
        <Input
          id="title"
          type="text"
          placeholder="タスク名を入力してください"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="dueDate" className="text-sm font-medium">
          期限
        </label>
        <Input
          id="dueDate"
          type="date"
          min={getTodayJST()}
          {...register("dueDate")}
        />
        {errors.dueDate && (
          <p className="text-sm text-red-500">{errors.dueDate.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="priority" className="text-sm font-medium">
          優先順位
        </label>
        <Controller
          control={control}
          name="priority"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger id="priority" onBlur={field.onBlur}>
                <SelectValue placeholder="優先順位を選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HIGH">HIGH</SelectItem>
                <SelectItem value="MIDDLE">MIDDLE</SelectItem>
                <SelectItem value="LOW">LOW</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.priority && (
          <p className="text-sm text-red-500">{errors.priority.message}</p>
        )}
      </div>

      <Button type="submit" disabled={!isValid || isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        登録する
      </Button>
    </form>
  );
}
