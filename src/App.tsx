import React, { useState } from "react";
import EquipmentTab from "./components/EquipmentTab";
import WiringTab from "./components/WiringTab";
import CodingTab from "./components/CodingTab";
import SimulatorTab from "./components/SimulatorTab";
import TroubleshootTab from "./components/TroubleshootTab";
import DataFlowSection from "./components/DataFlowSection";
import { Cpu, LayoutGrid, Radio, HeartPulse, Sparkles, BookOpen, User, HelpCircle, AlertCircle } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"equipment" | "wiring" | "coding" | "simulator" | "troubleshoot">("equipment");

  // Stub code to pass to troubleshooter
  const mockCurrentCode = `// ESP32 Posture Guard Configuration
#define VIB_PIN 13
#define RED_LED_PIN 12
#define GREEN_LED_PIN 14
const float ANGLE_THRESHOLD = 15.0;
const unsigned long DURATION_THRESHOLD = 10000;`;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col font-sans" id="app-root">
      {/* Premium Navigation Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-xs" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-md shadow-indigo-100 flex items-center justify-center">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-slate-800 text-lg md:text-xl tracking-tight leading-none">
                  IoT Posture Guard
                </h1>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  ม.2/3 กลุ่ม 310
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                เครื่องมือตรวจจับและแจ้งเตือนการก้มคอเพื่อป้องกันภาวะ Text Neck Syndrome
              </p>
            </div>
          </div>

          {/* Student Group Banner Info */}
          <div className="flex items-center space-x-3 bg-slate-50 border border-slate-100 p-2 px-3.5 rounded-2xl text-xs text-slate-600">
            <User className="w-4 h-4 text-indigo-500 shrink-0" />
            <div className="leading-normal font-sans">
              <span className="font-semibold block text-slate-800">ผู้พัฒนาโครงงานสิ่งประดิษฐ์:</span>
              <span className="text-[11px] text-slate-500">
                1. ภรัทพล (18) | 2. ณทิพรดา (27) | 3. ณัฏฐ์ชนากานต์ (28)
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Project Intro banner block with stats on Text Neck */}
        <section className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-md border border-slate-850 relative overflow-hidden" id="project-intro-banner">
          {/* Subtle graphic curves */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl z-0" />
          <div className="absolute -bottom-12 -left-12 w-60 h-60 rounded-full bg-sky-500/10 blur-3xl z-0" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-3.5">
              <div className="flex items-center space-x-2">
                <span className="bg-indigo-500/30 text-indigo-200 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  ประเภทโครงงาน: สิ่งประดิษฐ์ ม.2
                </span>
                <span className="bg-emerald-500/30 text-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center">
                  <HeartPulse className="w-3 h-3 mr-1" /> สุขภาพกาย
                </span>
              </div>
              <h2 className="text-xl md:text-3xl font-extrabold tracking-tight">
                ก้มหัวดูจอมือถือ คอของคุณต้องรับน้ำหนักถึง 27 กิโลกรัม! 📱
              </h2>
              <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-sans max-w-2xl">
                การวิจัยกายภาพบำบัดพบว่า การก้มคอเล่นสมาร์ทโฟน 60 องศา จะทำให้กล้ามเนื้อคอและบ่าต้องรับภาระหนักมากถึง 27 กก. ส่งผลให้เกิดอาการปวดคอรื้อรัง กระดูกคอเสื่อมก่อนวัย (Cervical Spondylosis) น้องๆ ม.2/3 กลุ่ม 310 จึงพัฒนาสิ่งประดิษฐ์ใช้ <strong className="text-white font-medium">ESP32 + MPU6050</strong> คอยแจ้งเตือนผ่านมอเตอร์สั่นสะเทือนและรายงานเข้า LINE เพื่อช่วยปรับปรุงสรีระท่านั่งให้ถูกต้องทันที!
              </p>
            </div>
            
            <div className="md:col-span-4 bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between h-full space-y-4">
              <div className="flex items-start space-x-2.5">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 font-sans">
                  <strong className="text-white font-semibold">สมมติฐานสิ่งประดิษฐ์:</strong> หากก้มคอเกิน 15° นานติดต่อกันเกิน 10 วินาที ระบบจะเตือนและสั่นเตือนผู้ใช้ทันที เพื่อให้เงยหน้ากลับมานั่งตัวตรง
                </div>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between items-center text-xs">
                <span className="text-slate-400">ค่ามาตรฐานเกณฑ์ก้ม</span>
                <span className="font-mono text-amber-300 font-bold">15 องศา (เกิน 10s)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Data Flow Diagram Section */}
        <DataFlowSection />

        {/* Tab Selector Buttons */}
        <div className="flex overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-200" id="tabs-navigation">
          <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 min-w-max md:min-w-0 md:w-auto">
            <button
              onClick={() => setActiveTab("equipment")}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === "equipment"
                  ? "bg-white text-indigo-700 shadow-sm border border-slate-200/30"
                  : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50/50"
              }`}
            >
              <span>🔌 1. สำรวจอุปกรณ์</span>
            </button>

            <button
              onClick={() => setActiveTab("wiring")}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === "wiring"
                  ? "bg-white text-indigo-700 shadow-sm border border-slate-200/30"
                  : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50/50"
              }`}
            >
              <span>🗺️ 2. ขั้นตอนการต่อสาย</span>
            </button>

            <button
              onClick={() => setActiveTab("coding")}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === "coding"
                  ? "bg-white text-indigo-700 shadow-sm border border-slate-200/30"
                  : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50/50"
              }`}
            >
              <span>💻 3. เขียนโค้ด ESP32</span>
            </button>

            <button
              onClick={() => setActiveTab("simulator")}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === "simulator"
                  ? "bg-white text-indigo-700 shadow-sm border border-slate-200/30"
                  : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50/50"
              }`}
            >
              <span>⏱️ 4. ตัวจำลองการทำงาน</span>
            </button>

            <button
              onClick={() => setActiveTab("troubleshoot")}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === "troubleshoot"
                  ? "bg-white text-indigo-700 shadow-sm border border-slate-200/30"
                  : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50/50"
              }`}
            >
              <span className="flex items-center space-x-1">
                <span>🤖 5. บอทถาม-ตอบ AI</span>
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <section className="transition-all duration-300" id="tabs-content-area">
          {activeTab === "equipment" && <EquipmentTab />}
          {activeTab === "wiring" && <WiringTab />}
          {activeTab === "coding" && <CodingTab />}
          {activeTab === "simulator" && <SimulatorTab />}
          {activeTab === "troubleshoot" && <TroubleshootTab currentCode={mockCurrentCode} />}
        </section>

      </main>

      {/* Interactive Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12 text-slate-400 text-xs" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2.5">
            <BookOpen className="w-4 h-4 text-slate-300" />
            <span className="font-medium font-sans">
              คู่มือความรู้วิทยาการคำนวณและไอโอที (IoT & Computer Science Learning Toolkit) ม.2
            </span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            © 2026 AI Studio Build for Group 310, Grade 8. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
