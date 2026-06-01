import { useState } from "react";
import { SendHorizontalIcon, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MessageInputProps } from "../types";

const presets = [
  "Summarize this page",
  "Find the next step",
  "Fill the form",
];

export function MessageInput({ onSubmit, isSending, onCancel }: MessageInputProps) {
  const [inputValue, setInputValue] = useState("");

  const submit = (value = inputValue) => {
    const trimmed = value.trim();
    if (!trimmed || isSending) return;
    onSubmit(trimmed);
    setInputValue("");
  };

  return (
    <footer className="border-t bg-background p-3">
      <div className="mb-2 flex gap-1.5 overflow-x-auto">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => submit(preset)}
            disabled={isSending}
            className="shrink-0 rounded-md border bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            {preset}
          </button>
        ))}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="relative"
      >
        <textarea
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="Tell Xeon what to do..."
          rows={2}
          className={cn(
            "max-h-32 min-h-[56px] w-full resize-none rounded-lg border bg-card px-3 py-2 pr-12 text-sm leading-relaxed outline-none",
            "placeholder:text-muted-foreground/70 focus:border-primary/60",
          )}
        />
        <Button
          type={isSending ? "button" : "submit"}
          size="icon"
          variant={isSending ? "destructive" : "default"}
          onClick={isSending ? onCancel : undefined}
          className="absolute bottom-2 right-2 h-8 w-8"
        >
          {isSending ? <Square className="h-3.5 w-3.5" /> : <SendHorizontalIcon className="h-3.5 w-3.5" />}
        </Button>
      </form>
    </footer>
  );
}
