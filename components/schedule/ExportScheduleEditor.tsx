"use client";

import React, { useState, useRef, useCallback } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Loader2, Image as ImageIcon, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { toPng } from "html-to-image";
import { useDropzone } from "react-dropzone";

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

const FONTS = [
  { value: "'Inter', sans-serif", label: "Inter (Mặc định)" },
  { value: "'Roboto', sans-serif", label: "Roboto" },
  { value: "'Outfit', sans-serif", label: "Outfit" },
  { value: "'Montserrat', sans-serif", label: "Montserrat" },
  { value: "'Nunito', sans-serif", label: "Nunito" },
  { value: "'Playfair Display', serif", label: "Playfair Display" },
];

export function ExportScheduleEditor({
  initialSchedule,
}: ExportScheduleEditorProps) {
  // Global
  const [title, setTitle] = useState("Lịch Học Chính Thức");
  
  // Typography
  const [fontFamily, setFontFamily] = useState(FONTS[0].value);
  const [fontSizeBase, setFontSizeBase] = useState(12);

  // Background
  const [bgType, setBgType] = useState<"gradient" | "image">("gradient");
  const [bgGradient, setBgGradient] = useState(GRADIENTS[0]);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgImageFit, setBgImageFit] = useState<"cover" | "contain" | "100% 100%">("cover");
  const [bgImagePosition, setBgImagePosition] = useState<"center" | "top" | "bottom">("center");
  const [bgOverlayOpacity, setBgOverlayOpacity] = useState(0);

  // Palette & Colors
  const [palette, setPalette] = useState<
    "pastel" | "vibrant" | "monochrome" | "dark" | "custom"
  >("pastel");
  const [customColors, setCustomColors] = useState<string[]>([
    "#f87171", "#fb923c", "#facc15", "#4ade80", "#2dd4bf", "#60a5fa", "#a78bfa"
  ]);

  // Table Configuration
  const [showRoom, setShowRoom] = useState(true);
  const [showCode, setShowCode] = useState(true);
  const [borderRadius, setBorderRadius] = useState(8);
  const [borderWidth, setBorderWidth] = useState(1);
  const [opacity, setOpacity] = useState(90); // Class block background opacity
  const [tableBgOpacity, setTableBgOpacity] = useState(0.8); // Grid cells background opacity

  const [isExporting, setIsExporting] = useState(false);

  const exportRef = useRef<HTMLDivElement>(null);

  const pseudoSchedule: GeneratedSchedule = {
    classes: initialSchedule,
    scores: {
      preferredScore: 0, avoidScore: 0, balanceScore: 0, morningScore: 0,
      afternoonScore: 0, leftmostScore: 0, rightmostScore: 0, totalScore: 0,
    },
    hasViolations: false,
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setBgImage(event.target?.result as string);
      setBgType("image");
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  const handleExport = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        style: { transform: "scale(1)", transformOrigin: "top left" },
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

  const updateCustomColor = (index: number, val: string) => {
    const newColors = [...customColors];
    newColors[index] = val;
    setCustomColors(newColors);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
      {/* Controls */}
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label>Tiêu đề lịch</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <Tabs defaultValue="background" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-auto">
                <TabsTrigger value="background" className="py-2 text-xs">Nền</TabsTrigger>
                <TabsTrigger value="typography" className="py-2 text-xs">Chữ</TabsTrigger>
                <TabsTrigger value="table" className="py-2 text-xs">Bảng</TabsTrigger>
                <TabsTrigger value="colors" className="py-2 text-xs">Màu</TabsTrigger>
              </TabsList>
              
              <TabsContent value="background" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Loại hình nền</Label>
                  <Select value={bgType} onValueChange={(v: any) => setBgType(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <div className="space-y-4">
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/30 hover:bg-muted/50"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      {bgImage ? (
                        <p className="text-sm font-medium text-primary">Ảnh đã tải. Click hoặc thả ảnh khác để đổi.</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Kéo thả ảnh nền vào đây, hoặc click</p>
                      )}
                    </div>
                    
                    {bgImage && (
                      <>
                        <div className="space-y-2">
                          <Label>Kiểu hiển thị ảnh</Label>
                          <Select value={bgImageFit} onValueChange={(v: any) => setBgImageFit(v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cover">Vừa vặn (Cover)</SelectItem>
                              <SelectItem value="contain">Nằm gọn (Contain)</SelectItem>
                              <SelectItem value="100% 100%">Kéo dãn (Stretch)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Vị trí ảnh</Label>
                          <Select value={bgImagePosition} onValueChange={(v: any) => setBgImagePosition(v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="center">Giữa</SelectItem>
                              <SelectItem value="top">Trên</SelectItem>
                              <SelectItem value="bottom">Dưới</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Độ phủ tối nền ảnh: {bgOverlayOpacity}%</Label>
                          <Slider
                            value={[bgOverlayOpacity]}
                            onValueChange={(vals) => setBgOverlayOpacity(vals[0])}
                            min={0} max={90} step={5} className="py-2"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="typography" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Font chữ</Label>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FONTS.map(f => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cỡ chữ cơ bản: {fontSizeBase}px</Label>
                  <Slider
                    value={[fontSizeBase]}
                    onValueChange={(vals) => setFontSizeBase(vals[0])}
                    min={10} max={18} step={1} className="py-2"
                  />
                </div>
              </TabsContent>

              <TabsContent value="table" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Độ trong suốt nền lưới: {Math.round(tableBgOpacity * 100)}%</Label>
                  <Slider
                    value={[tableBgOpacity * 100]}
                    onValueChange={(vals) => setTableBgOpacity(vals[0] / 100)}
                    min={0} max={100} step={5} className="py-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Độ bo góc ô môn học: {borderRadius}px</Label>
                  <Slider
                    value={[borderRadius]}
                    onValueChange={(vals) => setBorderRadius(vals[0])}
                    min={0} max={24} step={2} className="py-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Độ dày viền môn học: {borderWidth}px</Label>
                  <Slider
                    value={[borderWidth]}
                    onValueChange={(vals) => setBorderWidth(vals[0])}
                    min={0} max={4} step={1} className="py-2"
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Label htmlFor="showRoom" className="cursor-pointer">Hiển thị phòng học</Label>
                  <Switch id="showRoom" checked={showRoom} onCheckedChange={setShowRoom} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showCode" className="cursor-pointer">Hiển thị mã môn</Label>
                  <Switch id="showCode" checked={showCode} onCheckedChange={setShowCode} />
                </div>
              </TabsContent>

              <TabsContent value="colors" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Bảng màu môn học</Label>
                  <Select value={palette} onValueChange={(v: any) => setPalette(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pastel">Pastel (Nhẹ nhàng)</SelectItem>
                      <SelectItem value="vibrant">Vibrant (Rực rỡ)</SelectItem>
                      <SelectItem value="monochrome">Monochrome (Đơn sắc)</SelectItem>
                      <SelectItem value="dark">Dark Mode (Tối)</SelectItem>
                      <SelectItem value="custom">Tự chọn (Custom)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {palette === "custom" && (
                  <div className="space-y-2">
                    <Label>Phối màu môn học</Label>
                    <div className="grid grid-cols-7 gap-2">
                      {customColors.map((color, idx) => (
                        <div key={idx} className="relative aspect-square rounded overflow-hidden border shadow-sm">
                          <input 
                            type="color" 
                            value={color} 
                            onChange={(e) => updateCustomColor(idx, e.target.value)}
                            className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <Label>Độ trong suốt nền môn: {opacity}%</Label>
                  <Slider
                    value={[opacity]}
                    onValueChange={(vals) => setOpacity(vals[0])}
                    min={20} max={100} step={5} className="py-2"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <Button
              className="w-full mt-4 shadow-lg hover:shadow-xl font-bold h-12"
              size="lg"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
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
            background: bgType === "image" && bgImage ? "transparent" : bgGradient,
            padding: "32px",
          }}
        >
          {/* Background Image Layer */}
          {bgType === "image" && bgImage && (
            <div 
              className="absolute inset-0 z-0 pointer-events-none"
              style={{
                background: `url(${bgImage}) ${bgImagePosition}/${bgImageFit} no-repeat`,
              }}
            >
              {/* Overlay */}
              <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${bgOverlayOpacity / 100})` }} />
            </div>
          )}

          {/* Content Layer */}
          <div className="relative z-10">
            {/* Header Area inside Export */}
            <div className="mb-6 flex flex-col items-center justify-center text-center">
              <h1
                className="text-3xl md:text-4xl font-extrabold tracking-tight"
                style={{
                  fontFamily: fontFamily,
                  color:
                    palette === "dark" ||
                    (bgType === "gradient" && (bgGradient.includes("#0f2027") || bgGradient.includes("#1e3c72"))) ||
                    (bgType === "image" && bgOverlayOpacity > 40)
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
              customColors={customColors}
              fontFamily={fontFamily}
              fontSizeBase={fontSizeBase}
              showRoom={showRoom}
              showCode={showCode}
              borderRadius={borderRadius}
              borderWidth={borderWidth}
              opacity={opacity / 100}
              tableBgOpacity={tableBgOpacity}
            />

            <div
              className="mt-4 text-right text-xs opacity-60 font-medium"
              style={{
                fontFamily: fontFamily,
                color:
                  palette === "dark" ||
                  (bgType === "gradient" && (bgGradient.includes("#0f2027") || bgGradient.includes("#1e3c72"))) ||
                  (bgType === "image" && bgOverlayOpacity > 40)
                    ? "#ffffff"
                    : "#000",
              }}
            >
              Tạo bởi Portal Helper
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
