"use client";

import React, { useState, useRef } from "react";
import { SelectedClass, GeneratedSchedule } from "@/lib/algo/types";
import { CustomizableScheduleTable } from "./CustomizableScheduleTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Download, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { toPng } from "html-to-image";

interface ExportScheduleEditorProps {
  initialSchedule: SelectedClass[];
}

const GRADIENTS = [
  "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
  "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
  "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
  "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
  "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)",
  "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
  "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
];

export function ExportScheduleEditor({
  initialSchedule,
}: ExportScheduleEditorProps) {
  const [title, setTitle] = useState("Lịch Học Chính Thức");
  const [palette, setPalette] = useState<
    "pastel" | "vibrant" | "monochrome" | "dark"
  >("pastel");
  const [bgType, setBgType] = useState<"gradient" | "image">("gradient");
  const [bgGradient, setBgGradient] = useState(GRADIENTS[0]);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [showRoom, setShowRoom] = useState(true);
  const [showCode, setShowCode] = useState(true);
  const [roundedCorners, setRoundedCorners] = useState(true);
  const [opacity, setOpacity] = useState(90);
  const [isExporting, setIsExporting] = useState(false);

  const exportRef = useRef<HTMLDivElement>(null);

  const pseudoSchedule: GeneratedSchedule = {
    classes: initialSchedule,
    scores: {
      preferredScore: 0,
      avoidScore: 0,
      balanceScore: 0,
      morningScore: 0,
      afternoonScore: 0,
      leftmostScore: 0,
      rightmostScore: 0,
      totalScore: 0,
    },
    hasViolations: false,
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setBgImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleExport = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      });
      const link = document.createElement("a");
      link.download = `${title.replace(/\s+/g, "-").toLowerCase()}-export.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Xuất ảnh thành công!");
    } catch (e) {
      toast.error("Lỗi khi xuất ảnh");
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
      {/* Controls */}
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label>Tiêu đề lịch</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Bảng màu môn học</Label>
              <Select value={palette} onValueChange={(v: any) => setPalette(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pastel">Pastel (Nhẹ nhàng)</SelectItem>
                  <SelectItem value="vibrant">Vibrant (Rực rỡ)</SelectItem>
                  <SelectItem value="monochrome">
                    Monochrome (Đơn sắc)
                  </SelectItem>
                  <SelectItem value="dark">Dark Mode (Tối)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Độ trong suốt nền môn học: {opacity}%</Label>
              <Slider
                value={[opacity]}
                onValueChange={(vals) => setOpacity(vals[0])}
                min={20}
                max={100}
                step={5}
                className="py-2"
              />
            </div>

            <div className="space-y-2">
              <Label>Loại hình nền (Background)</Label>
              <Select value={bgType} onValueChange={(v: any) => setBgType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gradient">Màu Gradient</SelectItem>
                  <SelectItem value="image">Hình ảnh tự tải lên</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {bgType === "gradient" && (
              <div className="space-y-2">
                <Label>Chọn Gradient</Label>
                <div className="flex flex-wrap gap-2">
                  {GRADIENTS.map((g, idx) => (
                    <button
                      key={idx}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${bgGradient === g ? "border-primary scale-110" : "border-transparent"}`}
                      style={{ background: g }}
                      onClick={() => setBgGradient(g)}
                    />
                  ))}
                </div>
              </div>
            )}

            {bgType === "image" && (
              <div className="space-y-2">
                <Label>Tải ảnh lên</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label htmlFor="showRoom" className="cursor-pointer">
                  Hiển thị phòng học
                </Label>
                <Switch
                  id="showRoom"
                  checked={showRoom}
                  onCheckedChange={setShowRoom}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showCode" className="cursor-pointer">
                  Hiển thị mã môn
                </Label>
                <Switch
                  id="showCode"
                  checked={showCode}
                  onCheckedChange={setShowCode}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="rounded" className="cursor-pointer">
                  Bo góc khối môn học
                </Label>
                <Switch
                  id="rounded"
                  checked={roundedCorners}
                  onCheckedChange={setRoundedCorners}
                />
              </div>
            </div>

            <Button
              className="w-full mt-4 shadow-lg hover:shadow-xl font-bold h-12"
              size="lg"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Download className="w-5 h-5 mr-2" />
              )}
              XUẤT ẢNH PNG
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preview Area */}
      <div className="flex justify-center overflow-x-auto pb-8 bg-muted/10 rounded-xl border border-dashed p-4 lg:p-8">
        <div
          ref={exportRef}
          className="relative w-full min-w-[800px] max-w-[1000px] overflow-hidden rounded-xl shadow-2xl transition-all"
          style={{
            background:
              bgType === "image" && bgImage
                ? `url(${bgImage}) center/cover no-repeat`
                : bgGradient,
            padding: "32px",
          }}
        >
          {/* Header Area inside Export */}
          <div className="mb-6 flex flex-col items-center justify-center text-center">
            <h1
              className="text-3xl md:text-4xl font-extrabold tracking-tight"
              style={{
                color:
                  palette === "dark" ||
                  bgGradient.includes("#0f2027") ||
                  bgGradient.includes("#1e3c72")
                    ? "#ffffff"
                    : "#111827",
                textShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              {title}
            </h1>
          </div>

          <CustomizableScheduleTable
            schedule={pseudoSchedule}
            palette={palette}
            showRoom={showRoom}
            showCode={showCode}
            roundedCorners={roundedCorners}
            opacity={opacity / 100}
          />

          <div
            className="mt-4 text-right text-xs opacity-60"
            style={{
              color:
                palette === "dark" ||
                bgGradient.includes("#0f2027") ||
                bgGradient.includes("#1e3c72")
                  ? "#ffffff"
                  : "#000",
            }}
          >
            Tạo bởi Portal Helper
          </div>
        </div>
      </div>
    </div>
  );
}
