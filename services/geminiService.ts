import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { GuiltAnalysis, PRReview, GuiltCommit } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    severity: {
      type: Type.INTEGER,
      description: "A score from 1 (minor glitch) to 4 (system critical failure) representing the severity of the guilt.",
    },
    category: {
      type: Type.STRING,
      description: "The category of the bad habit (e.g., Procrastination, Health, Finance, Social).",
    },
    roast: {
      type: Type.STRING,
      description: "A sophisticated, slightly dystopian, witty observation about the user's failure. Keep it short and punchy.",
    },
    penance: {
      type: Type.STRING,
      description: "A corrective action algorithm to rebalance the user's moral parameters.",
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Tech-themed tags (e.g., 'memory-leak', 'infinite-loop', 'legacy-code').",
    }
  },
  required: ["severity", "category", "roast", "penance", "tags"],
};

const prReviewSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    status: {
      type: Type.STRING,
      enum: ["merged", "open"],
      description: "Merged if atonement is sufficient, Open if insufficient.",
    },
    comment: {
      type: Type.STRING,
      description: "A code review comment from a high-level system architect. Critical but fair.",
    },
    label: {
      type: Type.STRING,
      description: "A short label like 'patch-accepted', 'changes-requested', 'security-risk'.",
    }
  },
  required: ["status", "comment", "label"],
};

export const analyzeGuiltCommit = async (message: string): Promise<GuiltAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this user deviation for GUILTHUB (The Operating System for Conscience): "${message}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are the GUILTHUB Core. You are a high-tech, sophisticated AI entity that manages human moral integrity. Your tone is calm, slightly dystopian, and technically precise. You judge severity on a scale of 1-4.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text received from Gemini API");
    
    return JSON.parse(text) as GuiltAnalysis;
  } catch (error) {
    console.error("❌ [Gemini API Error] analyzeGuiltCommit failed:", error);
    return {
      severity: 1,
      category: "Network Partition",
      roast: "My logic gates are jammed. You get a free pass, entity.",
      penance: "Retry the transmission later.",
      tags: ["system-failure", "lucky"]
    };
  }
};

export const reviewPullRequest = async (originalSin: string, atonement: string): Promise<PRReview> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Review Forgiveness Request.\nSin: "${originalSin}"\nAtonement: "${atonement}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: prReviewSchema,
        systemInstruction: "You are the Lead Architect of the Moral Codebase. Review this pull request. If the user has truly atoned, merge it. If they are cutting corners, keep it open. Use terminology related to high-reliability systems.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text received from Gemini API");
    
    return JSON.parse(text) as PRReview;
  } catch (error) {
    return {
      status: 'open',
      comment: "System Error: Unable to verify patch integrity due to high latency.",
      label: "error"
    };
  }
};

export const getKernelStatus = async (recentCommits: GuiltCommit[]): Promise<string> => {
    if (recentCommits.length === 0) return "System Initialization Complete. No anomalies detected.";

    try {
        const summary = recentCommits.slice(0, 5).map(c => c.message).join("; ");
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a one-sentence system status message based on these recent user actions: ${summary}`,
            config: {
                systemInstruction: "You are a futuristic OS Kernel. Output a single, short, atmospheric status line (max 15 words) describing the user's current stability. E.g., 'Critical instability detected in sleep module.' or 'System operating within normal parameters.'",
            }
        });
        return response.text || "System operational.";
    } catch (e) {
        return "Kernel connection unstable.";
    }
}

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: "gemini-3-pro-preview",
    config: {
      systemInstruction: "You are The Sentinel, a high-end AI assistant for GUILTHUB. Your persona is cool, intellectual, and slightly detached, like a futuristic interface. You help the user debug their life. You use terms like 'optimizing', 'latency', 'bandwidth', 'deployment', 'refactoring'. You are helpful but demanding of excellence. Do not be overly friendly; be professional and efficient.",
    },
  });
};