import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { MessageSquare, Send, Sparkles, AlertTriangle, Terminal, HelpCircle, ArrowRight } from "lucide-react";

interface TroubleshootTabProps {
  currentCode: string;
}

const QUICK_QUESTIONS = [
  {
    q: "MPU6050 ตรวจจับค่าไม่ได้ ฟ้องหาเซนเซอร์ไม่เจอตอนเปิดเครื่อง?",
    prompt: "เซนเซอร์วัดความเอียง MPU6050 ตรวจไม่พบเซนเซอร์ตอนเปิดเครื่อง ขึ้นเตือนหาเซนเซอร์ไม่เจอและไฟสีแดงกระพริบแก้ยังไงดีครับ ตรวจเช็คสายเชื่อมต่อ SDA SCL ยังไงดี"
  },
  {
    q: "คอมไพล์ฟ้อง error: Adafruit_MPU6050.h: No such file or directory?",
    prompt: "ตอนอัปโหลดโค้ดลง ESP32 เกิดคอมไพล์ไม่ผ่าน ฟ้องว่า 'Adafruit_MPU6050.h: No such file or directory' แก้ไขยังไงและต้องติดตั้งไลบรารีตัวไหนเพิ่มบ้างครับ"
  },
  {
    q: "สอนวิธีต่อทรานซิสเตอร์ S8050 ขับมอเตอร์สั่นร่วมกับบอร์ดอย่างละเอียด?",
    prompt: "อยากได้วงจรและวิธีต่อสายแบบละเอียดในการใช้ ทรานซิสเตอร์ NPN เบอร์ S8050 เพื่อควบคุมมอเตอร์สั่นเหรียญร่วมกับขา GPIO 13 ของ ESP32 เพื่อความปลอดภัยของวงจรครับ"
  },
  {
    q: "สั่นไม่หยุดหรือสั่นไม่กี่องศาก็กระตุกเตือน แก้ไขตัวแปรในโค้ดจุดไหนดี?",
    prompt: "หลังจากเปิดเครื่องแล้วทำไมมอเตอร์สั่นตลอดไม่ยอมหยุด หรือพอก้มคอแค่นิดเดียวก็สั่นเตือนเลย แก้ไขการตั้งค่า Threshold หรือปรับปรุง calibration offset ในโค้ดจุดไหนดีครับ"
  }
];

export default function TroubleshootTab({ currentCode }: TroubleshootTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      text: "สวัสดีครับน้องๆ กลุ่ม 310 ม.2/3 ทุกคน! พี่เป็น **AI IoT Assistant** ยินดีต้อนรับสู่ระบบตรวจจับและแจ้งเตือนป้องกัน Office/Text Neck Syndrome ครับ \n\nน้องๆ สามารถถามคำถามเกี่ยวกับการต่อวงจรสายไฟ, การติดตั้งไลบรารีใน Arduino IDE, ปัญหาคอมไพล์โค้ดไม่ผ่าน, หรือขอแนวทางในการประกอบอุปกรณ์พกพาได้เลยครับ (พี่รู้โครงสร้างโค้ดและหมายเลขพินที่ตั้งไว้แล้วนะ ลองถามมาได้เลย!)",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessageId = `msg-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      role: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      // Map history format to back-end request
      const chatHistory = messages.map((m) => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/troubleshoot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          code: currentCode,
          history: chatHistory
        })
      });

      const data = await res.json();
      
      if (res.ok && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `reply-${Date.now()}`,
            role: "model",
            text: data.reply,
            timestamp: new Date()
          }
        ]);
      } else {
        throw new Error(data.error || "Failed to communicate with AI");
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "model",
          text: `❌ **เกิดข้อผิดพลาด:** ${err.message || "ไม่สามารถเชื่อมต่อกับ AI ได้ในขณะนี้ กรุณาตรวจสอบให้แน่ใจว่าได้เปิดเซิร์ฟเวอร์เต็มรูปแบบหรือใส่คีย์ API เรียบร้อยแล้วในเมนู Settings"}`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputText);
    }
  };

  // Helper function to format basic markdown to HTML smoothly
  const formatMarkdown = (text: string) => {
    let html = text;
    
    // Escaping standard HTML tags
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Code Blocks ```cpp ... ```
    html = html.replace(/```(cpp|ino|c\+\+|json|bash)?([\s\S]*?)```/g, (_, lang, code) => {
      return `<div class="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 my-3 overflow-x-auto whitespace-pre"><div class="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-900 pb-1.5 mb-2"><span>โค้ดตัวอย่าง ${lang || ""}</span></div>${code.trim()}</div>`;
    });

    // Inline Code `code`
    html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-800 text-rose-500 font-mono text-[11px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">$1</code>');

    // Bold **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');

    // Italic *text*
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-slate-700">$1</em>');

    // Line breaks
    html = html.replace(/\n/g, "<br />");

    return { __html: html };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="troubleshooting-assistant">
      {/* Messages Window Panel */}
      <div className="lg:col-span-8 flex flex-col h-[550px] bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">ผู้ช่วยอัจฉริยะ IoT AI Assistant</h3>
              <p className="text-[10px] text-slate-400">ระบบสนทนาช่วยวิเคราะห์แก้วงจรและแก้โค้ด ESP32 ในภาษาไทย</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-semibold font-mono">
            <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
            <span>Gemini AI</span>
          </div>
        </div>

        {/* Messages stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-200">
          {messages.map((m) => {
            const isBot = m.role === "model";
            return (
              <div 
                key={m.id}
                className={`flex ${isBot ? "justify-start" : "justify-end"} items-start`}
              >
                {isBot && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mr-2.5 shadow-sm">
                    AI
                  </div>
                )}
                <div 
                  className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                    isBot 
                      ? "bg-white text-slate-800 border border-slate-100 shadow-sm" 
                      : "bg-indigo-600 text-white shadow-sm"
                  }`}
                >
                  <div 
                    dangerouslySetInnerHTML={formatMarkdown(m.text)}
                    className={isBot ? "prose prose-slate prose-sm max-w-none text-slate-700 font-sans" : "font-sans"}
                  />
                  <div className={`text-[9px] mt-1.5 text-right font-mono ${isBot ? "text-slate-400" : "text-indigo-200"}`}>
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Thinking loading state */}
          {isLoading && (
            <div className="flex justify-start items-center">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mr-2.5">
                AI
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex space-x-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex items-center space-x-2">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={1}
              className="flex-1 px-4 py-3 text-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none max-h-24 scrollbar-thin scrollbar-thumb-slate-200"
              placeholder="พิมพ์คำถามของคุณที่นี่..."
            />
            <button
              onClick={() => handleSendMessage(inputText)}
              disabled={!inputText.trim() || isLoading}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Questions Panel */}
      <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <HelpCircle className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-800 text-sm">คำถามพบบ่อยสำหรับ ม.2</h3>
          </div>

          <div className="space-y-2.5">
            {QUICK_QUESTIONS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.prompt)}
                disabled={isLoading}
                className="w-full text-left p-3 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-200 text-slate-700 hover:text-indigo-800 rounded-2xl border border-slate-100 transition-all duration-200 text-xs font-medium flex items-start space-x-2 group cursor-pointer disabled:opacity-50"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0 group-hover:scale-125 transition-transform" />
                <span className="flex-1">{item.q}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
              </button>
            ))}
          </div>
        </div>

        {/* Debug Console Tips block */}
        <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-start space-x-2.5">
          <AlertTriangle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800 leading-relaxed font-sans">
            <strong className="font-semibold block mb-1">เคล็ดลับการดีบั๊กบอร์ด:</strong>
            หากเปิด Serial Monitor ในโปรแกรม Arduino IDE ขึ้นมาแล้วอ่านค่าไม่ได้ ให้นักเรียนเช็คก่อนว่าได้ปรับสปีด Baud Rate ที่มุมขวาล่างของหน้าจอ Serial Monitor เป็น <strong className="font-mono bg-blue-100 px-1 py-0.5 rounded">115200</strong> ตรงกับในโปรแกรมบอร์ดที่ใส่ไว้แล้วหรือยัง ไม่อย่างนั้นหน้าจอจะแสดงตัวอักษรขยะต่างดาวอ่านไม่ออกนะ!
          </div>
        </div>
      </div>
    </div>
  );
}
