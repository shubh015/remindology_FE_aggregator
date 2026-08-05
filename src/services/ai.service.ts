import { apiClient } from '@/lib/api/client';
import { Summary, Topic, MCQ, RevisionNote, Mnemonic } from '@/types/content';
import { ApiResponse } from './auth.service';

// Strip leading option label: "(a)", "a)", "a.", "(1)", "1.", etc.
const stripLabel = (s: string) => s.replace(/^\s*\(?[a-d1-4]\)?[.)]\s*/i, '').trim();

function normalizeOptions(raw: unknown): string[] {
  let arr: string[] = [];
  if (Array.isArray(raw)) arr = (raw as unknown[]).map(String);
  else if (typeof raw === 'string') {
    try { arr = JSON.parse(raw); } catch { arr = [raw]; }
  }

  // Already 4 separate options — just clean leading labels
  if (arr.length >= 4) return arr.map(stripLabel);

  const combined = arr.join('\n');

  // Split by (a)/(b)/(c)/(d) or a)/b) style markers
  const byMarker = combined.split(/\s*\(?[a-d][).]\s*/i).map(s => s.trim()).filter(Boolean);
  if (byMarker.length === 4) return byMarker;

  // Split by newlines as fallback
  const byLine = combined.split(/\r?\n+/).map(stripLabel).filter(Boolean);
  if (byLine.length === 4) return byLine;

  return arr.map(stripLabel);
}

function resolveCorrectAnswer(raw: string, options: string[]): string {
  if (!raw) return '';
  // Single letter or (letter) — map to option by index
  const letterMatch = raw.match(/^\s*\(?([a-d])\)?\s*$/i);
  if (letterMatch) {
    const idx = 'abcd'.indexOf(letterMatch[1].toLowerCase());
    return idx >= 0 && idx < options.length ? options[idx] : raw;
  }
  // Full string with label — strip the label and match against parsed options
  const stripped = stripLabel(raw);
  return options.find(o => o === stripped || o.toLowerCase() === stripped.toLowerCase()) ?? stripped;
}

export const aiService = {
  // Summary
  async generateSummary(contentId: string): Promise<Summary> {
    const response = await apiClient.post<ApiResponse<{ id: string; content_id: string; result: string; created_at: string }>>(
      `/ai-analysis/contents/${contentId}/summary`
    );
    const data = response.data.data;
    return {
      id: data.id,
      contentId: data.content_id,
      summary: typeof data.result === 'string' ? data.result : (data.result as any)?.summary || '',
      created_at: data.created_at,
    };
  },

  async getSummary(contentId: string): Promise<Summary | null> {
    const response = await apiClient.get<ApiResponse<{ id: string; content_id: string; result: string; created_at: string } | null>>(
      `/ai-analysis/contents/${contentId}/summary`
    );
    const data = response.data.data;
    if (!data) return null;
    return {
      id: data.id,
      contentId: data.content_id,
      summary: typeof data.result === 'string' ? data.result : (data.result as any)?.summary || '',
      created_at: data.created_at,
    };
  },

  // Topics
  async generateTopics(contentId: string): Promise<Topic[]> {
    // 1. Extract topics via ai-analysis
    await apiClient.post<ApiResponse<any>>(`/ai-analysis/contents/${contentId}/topics`);
    // 2. Persist topics to contents and return them
    const response = await apiClient.post<ApiResponse<Topic[]>>(`/ai-analysis/contents/${contentId}/topics/persist`);
    return response.data.data;
  },

  async getTopics(contentId: string): Promise<Topic[]> {
    const response = await apiClient.get<ApiResponse<Topic[]>>(`/contents/${contentId}/topics`);
    return response.data.data || [];
  },

  // MCQs
  async generateMCQs(contentId: string): Promise<MCQ[]> {
    const response = await apiClient.post<ApiResponse<any[]>>(`/ai-analysis/contents/${contentId}/mcqs`);
    const rawList = response.data.data || [];
    return rawList.map((item) => {
      const options = normalizeOptions(item.options);
      const correctAnswer = resolveCorrectAnswer(item.correct_answer || item.correctAnswer || '', options);
      return {
        id: item.id,
        contentId: item.content_id || contentId,
        question: item.question,
        options,
        correctAnswer,
        explanation: item.explanation,
        difficulty: item.difficulty || 'MEDIUM',
        wrongOptionExplanations: item.wrongOptionExplanations || item.wrong_option_explanations,
      };
    });
  },

  async getMCQs(contentId: string): Promise<MCQ[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(`/ai-analysis/contents/${contentId}/mcqs`);
    const rawList = response.data.data || [];
    return rawList.map((item) => {
      const options = normalizeOptions(item.options);
      const correctAnswer = resolveCorrectAnswer(item.correct_answer || item.correctAnswer || '', options);
      return {
        id: item.id,
        contentId: item.content_id || contentId,
        question: item.question,
        options,
        correctAnswer,
        explanation: item.explanation,
        difficulty: item.difficulty || 'MEDIUM',
        wrongOptionExplanations: item.wrongOptionExplanations || item.wrong_option_explanations,
      };
    });
  },

  // Revision Notes
  async generateRevisionNotes(contentId: string): Promise<RevisionNote[]> {
    const response = await apiClient.post<ApiResponse<{ id: string; content_id: string; result: any; created_at: string }>>(
      `/ai-analysis/contents/${contentId}/revision-notes`
    );
    const data = response.data.data;
    if (!data) return [];

    const rawResult = data.result;
    let rawNotes: any[] = [];
    if (Array.isArray(rawResult)) {
      rawNotes = rawResult;
    } else if (rawResult && typeof rawResult === 'object') {
      if (Array.isArray(rawResult.revisionNotes)) {
        rawNotes = rawResult.revisionNotes;
      } else if (Array.isArray(rawResult.notes)) {
        rawNotes = rawResult.notes;
      } else if (Array.isArray(rawResult.revision_notes)) {
        rawNotes = rawResult.revision_notes;
      }
    }

    return rawNotes.map((item, idx) => {
      if (typeof item === 'string') {
        return {
          id: `${data.id}-${idx}`,
          contentId: data.content_id,
          title: `Key Takeaway ${idx + 1}`,
          content: item,
        };
      } else {
        return {
          id: item.id || `${data.id}-${idx}`,
          contentId: item.content_id || data.content_id,
          title: item.title || `Key Takeaway ${idx + 1}`,
          content: item.content || item.note || '',
        };
      }
    });
  },

  async getRevisionNotes(contentId: string): Promise<RevisionNote[]> {
    const response = await apiClient.get<ApiResponse<{ id: string; content_id: string; result: any; created_at: string } | null>>(
      `/ai-analysis/contents/${contentId}/revision-notes`
    );
    const data = response.data.data;
    if (!data) return [];

    const rawResult = data.result;
    let rawNotes: any[] = [];
    if (Array.isArray(rawResult)) {
      rawNotes = rawResult;
    } else if (rawResult && typeof rawResult === 'object') {
      if (Array.isArray(rawResult.revisionNotes)) {
        rawNotes = rawResult.revisionNotes;
      } else if (Array.isArray(rawResult.notes)) {
        rawNotes = rawResult.notes;
      } else if (Array.isArray(rawResult.revision_notes)) {
        rawNotes = rawResult.revision_notes;
      }
    }

    return rawNotes.map((item, idx) => {
      if (typeof item === 'string') {
        return {
          id: `${data.id}-${idx}`,
          contentId: data.content_id,
          title: `Key Takeaway ${idx + 1}`,
          content: item,
        };
      } else {
        return {
          id: item.id || `${data.id}-${idx}`,
          contentId: item.content_id || data.content_id,
          title: item.title || `Key Takeaway ${idx + 1}`,
          content: item.content || item.note || '',
        };
      }
    });
  },
  // Mnemonics
  async generateMnemonics(contentId: string): Promise<Mnemonic[]> {
    const response = await apiClient.post<ApiResponse<{ result: { mnemonics: Mnemonic[] } }>>(
      `/ai-analysis/contents/${contentId}/mnemonics`
    );
    return response.data.data?.result?.mnemonics || [];
  },

  async getMnemonics(contentId: string): Promise<Mnemonic[]> {
    const response = await apiClient.get<ApiResponse<{ result: { mnemonics: Mnemonic[] } } | null>>(
      `/ai-analysis/contents/${contentId}/mnemonics`
    );
    return response.data.data?.result?.mnemonics || [];
  },
};

export default aiService;
