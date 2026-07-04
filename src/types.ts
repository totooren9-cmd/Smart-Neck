export interface Equipment {
  id: string;
  name: string;
  thName: string;
  icon: string;
  description: string;
  thDescription: string;
  roleInProject: string;
  pins?: { pin: string; function: string }[];
  specs?: string[];
}

export interface WiringStep {
  step: number;
  title: string;
  description: string;
  imageAlt?: string;
  connections: { from: string; to: string; color: string; notes?: string }[];
}

export interface CodeConfig {
  wifiSsid: string;
  wifiPass: string;
  lineToken: string;
  angleThreshold: number;
  delaySec: number;
  enableLine: boolean;
  enableSerialDebug: boolean;
  enableLeds: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}
