import { describe, expect, it, vi } from 'vitest';

const resolveDownloadUrl = vi.fn();
const speechRecognition = vi.fn();

vi.mock('@/services/mediaDownload', () => ({
  resolveDownloadUrl,
}));

vi.mock('@/services/media', () => ({
  MediaService: {
    speechRecognition,
  },
}));

describe('transcribeAudioFile', () => {
  it('downloads the audio bytes and sends them to MediaService.speechRecognition', async () => {
    const bytes = new Uint8Array([1, 2, 3, 4]);
    resolveDownloadUrl.mockResolvedValue('https://download.example/audio.m4a');
    speechRecognition.mockResolvedValue({
      header: { success: true },
      recognitionResult: '今天下午三点同步方案',
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(bytes.buffer),
    }));

    const { transcribeAudioFile } = await import('./audioTranscription');

    await expect(transcribeAudioFile('audio-1')).resolves.toBe('今天下午三点同步方案');
    expect(resolveDownloadUrl).toHaveBeenCalledWith('audio-1');
    expect(fetch).toHaveBeenCalledWith('https://download.example/audio.m4a');
    expect(speechRecognition).toHaveBeenCalledWith(expect.objectContaining({
      speechContent: bytes,
    }));
  });
});
