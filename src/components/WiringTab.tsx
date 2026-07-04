import React, { useState } from "react";
import { WiringStep } from "../types";
import { Check, ArrowRight, Info, AlertTriangle, List, Eye } from "lucide-react";

const WIRING_STEPS: WiringStep[] = [
  {
    step: 1,
    title: "จัดวาง ESP32 บน Breadboard",
    description: "เสียบบอร์ด ESP32 DevKit ลงบนจุดกึ่งกลางของโฟโต้บอร์ด (Breadboard) โดยให้ขาทั้งสองฝั่งคร่อมร่องกลางพอดี เพื่อให้พินฝั่งซ้ายและขวาแยกจากกันเด็ดขาด ไม่เกิดการช็อตกันภายใน",
    connections: []
  },
  {
    step: 2,
    title: "ต่อเซนเซอร์ MPU6050 เข้ากับ ESP32",
    description: "เชื่อมต่อเซนเซอร์วัดความเอียงด้วยโปรโตคอล I2C โดยใช้สาย Jumper ตัวเมีย-ตัวผู้ โยงจากเซนเซอร์ไปยังบอร์ด ESP32",
    connections: [
      { from: "MPU6050 VCC", to: "ESP32 3V3", color: "🔴 แดง", notes: "จ่ายไฟเลี้ยง 3.3V ให้เซนเซอร์" },
      { from: "MPU6050 GND", to: "ESP32 GND", color: "⚫ ดำ", notes: "เชื่อมกราวด์ระบบเข้าด้วยกัน" },
      { from: "MPU6050 SDA", to: "ESP32 D21", color: "🔵 น้ำเงิน", notes: "สายสัญญาณข้อมูล I2C Data" },
      { from: "MPU6050 SCL", to: "ESP32 D22", color: "🟡 เหลือง", notes: "สายสัญญาณเวลา I2C Clock" }
    ]
  },
  {
    step: 3,
    title: "ต่อมอเตอร์สั่นสะเทือน (Vibration Coin Motor)",
    description: "ต่อมอเตอร์สั่นเหรียญเข้ากับขาสัญญาณควบคุม โดยต่อขั้วลบลงกราวด์ และขั้วบวกผ่านขาสัญญาณดิจิตอล",
    connections: [
      { from: "มอเตอร์ ขั้วบวก (+ สายสีแดง)", to: "ESP32 D13", color: "🟠 ส้ม", notes: "รับสัญญาณควบคุมแบบ HIGH/LOW เพื่อสั่นแจ้งเตือน" },
      { from: "มอเตอร์ ขั้วลบ (- สายสีดำ/น้ำเงิน)", to: "ESP32 GND", color: "⚫ ดำ", notes: "ต่อลงกราวด์ร่วมของบอร์ด" }
    ]
  },
  {
    step: 4,
    title: "ต่อไฟ LED แสดงสถานะท่านั่งและการเตือน",
    description: "ต่อหลอดไฟ LED แสดงสถานะความถูกต้องของท่าทาง เพื่อให้ผู้ใช้สังเกตเห็นได้ง่าย",
    connections: [
      { from: "LED สีเขียว (ปกติ) ขั้วบวก", to: "ESP32 D14", color: "🟢 เขียว", notes: "ควบคุมไฟสถานะท่านั่งปกติผ่านต้านทาน 220 Ohm" },
      { from: "LED สีแดง (ก้มคอ) ขั้วบวก", to: "ESP32 D12", color: "🔴 แดง", notes: "ควบคุมไฟเตือนก้มคอผ่านต้านทาน 220 Ohm" },
      { from: "ขาลบ (GND) ของ LED ทั้งหมด", to: "ESP32 GND", color: "⚫ ดำ", notes: "ต่อลงกราวด์ร่วมกัน" }
    ]
  },
  {
    step: 5,
    title: "ต่อระบบไฟเลี้ยงชาร์จได้ (TP4056 + แบตเตอรี่ LiPo + สวิตช์)",
    description: "ต่อระบบพลังงานเพื่อให้พกพาได้ โดยมีแบตเตอรี่ชาร์จผ่าน USB-C และตัดต่อการทำงานด้วยสวิตช์",
    connections: [
      { from: "แบตเตอรี่ LiPo ขั้วบวก (+)", to: "TP4056 B+", color: "🔴 แดง", notes: "ต่อขั้วบวกแบตเตอรี่เข้าช่องชาร์จ" },
      { from: "แบตเตอรี่ LiPo ขั้วลบ (-)", to: "TP4056 B-", color: "⚫ ดำ", notes: "ต่อขั้วลบแบตเตอรี่เข้าช่องชาร์จ" },
      { from: "TP4056 OUT-", to: "ESP32 GND", color: "⚫ ดำ", notes: "จ่ายไฟขั้วลบลงกราวด์ระบบ" },
      { from: "TP4056 OUT+", to: "สวิตช์ ขากลาง", color: "🔴 แดง", notes: "วิ่งเข้าขารับกระแสหลักของสวิตช์" },
      { from: "สวิตช์ ขาข้าง (ซ้ายหรือขวา)", to: "ESP32 Vin (หรือ 5V)", color: "🔴 แดง", notes: "ส่งไฟบวกไปเลี้ยงบอร์ดเมื่อผลักสวิตช์เปิดเครื่อง" }
    ]
  }
];

export default function WiringTab() {
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [viewMode, setViewMode] = useState<"steps" | "all">("steps");

  const toggleStepComplete = (stepNum: number) => {
    setCompletedSteps((prev) => ({ ...prev, [stepNum]: !prev[stepNum] }));
    if (stepNum < WIRING_STEPS.length && !completedSteps[stepNum]) {
      setActiveStep(stepNum + 1);
    }
  };

  const getWireColorClass = (colorStr: string) => {
    if (colorStr.includes("แดง")) return "border-red-500 text-red-600 bg-red-50";
    if (colorStr.includes("ดำ")) return "border-slate-800 text-slate-800 bg-slate-100";
    if (colorStr.includes("น้ำเงิน")) return "border-blue-500 text-blue-600 bg-blue-50";
    if (colorStr.includes("เหลือง")) return "border-amber-400 text-amber-700 bg-amber-50";
    if (colorStr.includes("ส้ม")) return "border-orange-500 text-orange-600 bg-orange-50";
    if (colorStr.includes("เขียว")) return "border-emerald-500 text-emerald-600 bg-emerald-50";
    return "border-slate-300 text-slate-600 bg-slate-50";
  };

  const currentStepData = WIRING_STEPS.find((s) => s.step === activeStep);

  return (
    <div className="space-y-6" id="wiring-guide-section">
      {/* Tab Control */}
      <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
        <div className="flex space-x-1.5">
          <button
            onClick={() => setViewMode("steps")}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              viewMode === "steps"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:bg-slate-100/50"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>สอนทีละขั้นตอน</span>
          </button>
          <button
            onClick={() => setViewMode("all")}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              viewMode === "all"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:bg-slate-100/50"
            }`}
          >
            <List className="w-4 h-4" />
            <span>สรุปตารางการต่อขาทั้งหมด</span>
          </button>
        </div>
        <div className="text-xs text-slate-400 font-mono hidden md:block">
          *ใช้ ESP32 GPIO 21 & 22 สำหรับ I2C และ GPIO 13 สำหรับมอเตอร์สั่น
        </div>
      </div>

      {viewMode === "steps" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Step navigator left panel */}
          <div className="hidden lg:block lg:col-span-4 space-y-2">
            <h3 className="font-semibold text-slate-700 text-xs uppercase tracking-wider mb-2">ขั้นตอนการต่อวงจร</h3>
            <div className="space-y-2">
              {WIRING_STEPS.map((step) => {
                const isActive = step.step === activeStep;
                const isDone = completedSteps[step.step] || false;
                return (
                  <button
                    key={step.step}
                    onClick={() => setActiveStep(step.step)}
                    className={`w-full p-3.5 rounded-xl text-left border transition-all duration-200 flex items-center justify-between ${
                      isActive 
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 scale-[1.02]" 
                        : "bg-white border-slate-100 text-slate-700 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      }`}>
                        {step.step}
                      </span>
                      <span className="text-sm font-medium">{step.title}</span>
                    </div>
                    {isDone && (
                      <span className={`p-0.5 rounded-full ${isActive ? "bg-white text-indigo-600" : "bg-emerald-50 text-emerald-600"}`}>
                        <Check className="w-4 h-4 stroke-[3.5]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* General Advice box */}
            <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-start space-x-2.5 mt-4">
              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800 leading-relaxed">
                <strong>💡 ข้อควรระวัง:</strong> อย่าเสียบสายไฟในขณะที่บอร์ดเชื่อมต่อคอมพิวเตอร์ผ่านสาย USB หรือเปิดสลับพลังงานจากแบตเตอรี่ เพราะอาจเกิดการลัดวงจรเสียหายได้ แนะนำให้ต่อให้เสร็จสิ้นเรียบร้อยแล้วเช็คสายก่อนจ่ายไฟเสมอ!
              </div>
            </div>
          </div>

          {/* Active step workspace right panel */}
          <div className="col-span-1 lg:col-span-8">
            {currentStepData && (
              <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between h-full min-h-[420px]" id="wiring-step-container">
                <div>
                  {/* Mobile Stepper Circles Header - High Polish Mobile UX */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-4 border-b border-slate-100 lg:hidden gap-3">
                    <span className="text-xs font-semibold text-slate-500 font-sans">ขั้นตอนประกอบวงจร:</span>
                    <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {WIRING_STEPS.map((s) => {
                        const isStepActive = s.step === activeStep;
                        const isStepCompleted = completedSteps[s.step] || false;
                        return (
                          <button
                            key={s.step}
                            onClick={() => setActiveStep(s.step)}
                            className={`w-7.5 h-7.5 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-all ${
                              isStepActive
                                ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                                : isStepCompleted
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            }`}
                          >
                            {s.step}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-3.5">
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      ขั้นตอนที่ {currentStepData.step} จาก {WIRING_STEPS.length}
                    </span>
                    {completedSteps[currentStepData.step] && (
                      <span className="bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full flex items-center animate-fadeIn">
                        <Check className="w-3.5 h-3.5 mr-1" /> เชื่อมต่อแล้ว
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-slate-800 text-lg sm:text-xl mb-2">{currentStepData.title}</h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">{currentStepData.description}</p>

                  {currentStepData.connections.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">ตารางเชื่อมต่อในขั้นตอนนี้</h4>
                      <div className="space-y-2.5">
                        {currentStepData.connections.map((c, idx) => (
                          <div 
                            key={idx} 
                            className="flex flex-col md:flex-row md:items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-sm"
                          >
                            <div className="flex items-center space-x-2.5 mb-2 md:mb-0">
                              <span className="font-semibold font-mono bg-white text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                                {c.from}
                              </span>
                              <ArrowRight className="w-4 h-4 text-slate-400" />
                              <span className="font-semibold font-mono bg-white text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                                {c.to}
                              </span>
                            </div>

                            <div className="flex items-center space-x-3">
                              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getWireColorClass(c.color)}`}>
                                สีสายไฟ: {c.color}
                              </span>
                              {c.notes && (
                                <span className="text-xs text-slate-500 font-sans italic md:max-w-xs text-right">
                                  ({c.notes})
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center text-slate-500 text-sm flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2.5 text-slate-400 font-mono font-bold">1</div>
                      <p>ขั้นตอนนี้ไม่มีการเชื่อมสายไฟเพิ่มเติม เป็นเพียงการจัดเตรียมวางตำแหน่งอุปกรณ์ไมโครคอนโทรลเลอร์</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                  <div className="text-xs text-slate-400 text-center md:text-left">
                    ตรวจสายให้ตรงช่อง และสีสายไฟเพื่อความเป็นระเบียบและหาง่าย
                  </div>
                  
                  {/* Step Navigation Controls - High Polish UX */}
                  <div className="flex flex-wrap items-center justify-center gap-2.5 w-full md:w-auto">
                    <button
                      disabled={activeStep === 1}
                      onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 font-medium text-xs sm:text-sm disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
                    >
                      ← ย้อนกลับ
                    </button>

                    <button
                      onClick={() => toggleStepComplete(currentStepData.step)}
                      className={`flex items-center justify-center space-x-1.5 px-4.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                        completedSteps[currentStepData.step]
                          ? "bg-slate-100 text-slate-700 border border-slate-200"
                          : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{completedSteps[currentStepData.step] ? "เรียบร้อย" : "เสร็จสิ้นขั้นตอนนี้"}</span>
                    </button>

                    <button
                      disabled={activeStep === WIRING_STEPS.length}
                      onClick={() => setActiveStep((prev) => Math.min(WIRING_STEPS.length, prev + 1))}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 font-medium text-xs sm:text-sm disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
                    >
                      ถัดไป →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Pinout summary table */
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden" id="wiring-summary-table">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">สรุปจุดเชื่อมโยงสายไฟของทั้งวงจร</h3>
              <p className="text-xs text-slate-500">ดูภาพรวมทราฟฟิกเชื่อมสายทั้งหมดอย่างง่ายเพื่อการไล่เช็ควงจรก่อนเปิดเครื่อง</p>
            </div>
            <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
              รวมทั้งหมด 11 จุดเชื่อมต่อ
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-sans border-collapse">
              <thead>
                <tr className="bg-slate-100/50 text-slate-600 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4">ต้นทาง (จากขาอุปกรณ์)</th>
                  <th className="p-4">ปลายทาง (ไปยังขาบอร์ด)</th>
                  <th className="p-4">สีสายแนะนำ</th>
                  <th className="p-4">การทำงาน / หน้าที่</th>
                  <th className="p-4 text-center">ประเภทไฟฟ้า</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {WIRING_STEPS.flatMap((step) => step.connections).map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-800">{c.from}</td>
                    <td className="p-4 font-mono font-bold text-slate-800">{c.to}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${getWireColorClass(c.color)}`}>
                        {c.color}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-normal text-slate-500">{c.notes}</td>
                    <td className="p-4 text-center">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                        c.from.includes("VCC") || c.to.includes("Vin") || c.to.includes("3V3") 
                          ? "bg-red-50 text-red-600"
                          : c.from.includes("GND") || c.to.includes("GND")
                          ? "bg-slate-100 text-slate-600"
                          : "bg-blue-50 text-blue-600"
                      }`}>
                        {c.from.includes("VCC") || c.to.includes("Vin") || c.to.includes("3V3") 
                          ? "POWER (ไฟเลี้ยง)"
                          : c.from.includes("GND") || c.to.includes("GND")
                          ? "GROUND (ดิน)"
                          : "SIGNAL (สัญญาณ)"
                        }
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-amber-50 border-t border-amber-100 flex items-start space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <strong>ข้อควรรู้สําหรับมอเตอร์สั่นแบบเหรียญ:</strong> หากนำขั้วบวกของมอเตอร์ต่อกับขา GPIO ของ ESP32 โดยตรง ควรเขียนโปรแกรมไม่ให้เปิดสั่นยาวนานต่อเนื่องเกินไปเพื่อป้องกันความร้อนสะสมและการดึงกระแสสูงเกินพิกัดพิน สำหรับตัวเครื่องใช้งานจริง แนะนำอย่างยิ่งให้ต่อผ่านวงจรขับสั่นแบบทรานซิสเตอร์ (NPN Transistor S8050) ร่วมกับไดโอด 1N4007 และตัวต้านทาน 1k เพื่อเพิ่มความมั่นคงและปลอดภัยสูงสุดให้บอร์ดครับ
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
