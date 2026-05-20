"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { z } from "zod";
import { ClassData, ClassDataSchema } from "@/lib/algo/types";
import { UploadCloud } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ClassDataDropzoneProps {
  onDataLoaded: (data: ClassData[]) => void;
}

export function ClassDataDropzone({ onDataLoaded }: ClassDataDropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);
        
        const result = z.array(ClassDataSchema).safeParse(json);
        if (result.success) {
          toast.success("Tải dữ liệu thành công!", {
            description: `Đã nạp ${result.data.length} lớp học hợp lệ.`,
          });
          onDataLoaded(result.data);
        } else {
          console.error(result.error);
          toast.error("Dữ liệu không hợp lệ", {
            description: "Cấu trúc JSON không khớp với ClassDataSchema.",
          });
        }
      } catch (err) {
        toast.error("Lỗi đọc file", {
          description: "File không phải định dạng JSON hợp lệ.",
        });
      }
    };
    reader.readAsText(file);
  }, [onDataLoaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/json": [".json"]
    },
    maxFiles: 1
  });

  return (
    <Card 
      className={`border-dashed border-2 transition-colors cursor-pointer ${isDragActive ? "border-primary bg-primary/5" : "bg-muted/30 hover:bg-muted/80"}`}
    >
      <CardContent 
        {...getRootProps()} 
        className="p-8 flex flex-col items-center justify-center text-center space-y-4 outline-none"
      >
        <input {...getInputProps()} />
        <div className="p-4 bg-card rounded-full shadow-sm border">
          <UploadCloud className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">
            {isDragActive 
              ? "Thả file JSON vào đây..." 
              : "Kéo thả file JSON hoặc click để chọn"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Chỉ hỗ trợ file .json chứa mảng danh sách lớp
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
