"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { saveDailyNote } from "@/lib/db/notes/actions";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

import { useRouter } from "next/navigation";

interface MarkdownNoteProps {
  initialContent: string;
  targetDate: string;
}

export function MarkdownNote({
  initialContent,
  targetDate,
}: MarkdownNoteProps) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent, targetDate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveDailyNote(content, targetDate);
      toast.success("Đã lưu ghi chú thành công!");
      router.refresh();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu ghi chú");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] border rounded-lg overflow-hidden bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between p-2 border-b bg-muted/30">
        <h3 className="font-semibold px-2">Ghi chú ngày {targetDate}</h3>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving || (content === initialContent && content !== "")}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Lưu
        </Button>
      </div>

      <Tabs defaultValue="write" className="flex-1 flex flex-col">
        <div className="px-4 pt-2">
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="write">Viết</TabsTrigger>
            <TabsTrigger value="preview">Xem trước</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="write" className="flex-1 p-0 m-0 border-t mt-2">
          <textarea
            className="w-full h-full p-4 resize-none focus:outline-none focus:ring-0 border-0 bg-transparent"
            placeholder="Viết ghi chú của bạn bằng Markdown ở đây..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </TabsContent>

        <TabsContent
          value="preview"
          className="flex-1 p-4 m-0 border-t mt-2 overflow-y-auto prose prose-sm max-w-none dark:prose-invert"
        >
          {content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          ) : (
            <div className="text-muted-foreground italic h-full flex items-center justify-center">
              Chưa có nội dung ghi chú.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
