import { useCallback, useEffect, useRef, useState } from 'react';
import { CactusLM } from '../classes/CactusLM';
import type {
  CactusCompletionParams,
  CactusCompletionResult,
  CactusDownloadParams,
  CactusEmbeddingParams,
  CactusEmbeddingResult,
  CactusInitParams,
} from '../types/CactusLM';

export const useCactusLM = () => {
  const cactusLMRef = useRef(new CactusLM());

  // State
  const [completion, setCompletion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cactusLM = cactusLMRef.current;

    return () => {
      (async () => {
        await cactusLM.stop();
        await cactusLM.destroy();
      })();
    };
  }, []);

  const download = useCallback(
    async ({ model, onProgress }: CactusDownloadParams = {}) => {
      try {
        await cactusLMRef.current.download({
          model,
          onProgress: (progress) => {
            setDownloadProgress(progress);
            onProgress?.(progress);
          },
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        setError(message);
        throw e;
      }
    },
    []
  );

  const init = useCallback(
    async ({ model, contextSize }: CactusInitParams = {}) => {
      await download({ model });

      setIsInitialized(false);
      try {
        await cactusLMRef.current.init({ model, contextSize });
        setIsInitialized(true);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        setError(message);
        throw e;
      }
    },
    [download]
  );

  const complete = useCallback(
    async ({
      messages,
      options,
      onToken,
      model,
      contextSize,
    }: CactusCompletionParams): Promise<CactusCompletionResult> => {
      if (isGenerating) {
        throw new Error('CactusLM is already generating');
      }

      await init({ model, contextSize });

      setCompletion('');
      setIsGenerating(true);
      try {
        return await cactusLMRef.current.complete({
          messages,
          options,
          onToken: (token) => {
            setCompletion((prev) => prev + token);
            onToken?.(token);
          },
          model,
          contextSize,
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        setError(message);
        throw e;
      } finally {
        setIsGenerating(false);
      }
    },
    [init, isGenerating]
  );

  const embed = useCallback(
    async ({
      text,
      model,
    }: CactusEmbeddingParams): Promise<CactusEmbeddingResult> => {
      if (isGenerating) {
        throw new Error('CactusLM is already generating');
      }

      await init({ model });

      setIsGenerating(true);
      try {
        return await cactusLMRef.current.embed({ text, model });
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        setError(message);
        throw e;
      } finally {
        setIsGenerating(false);
      }
    },
    [init, isGenerating]
  );

  const stop = useCallback(async () => {
    try {
      await cactusLMRef.current.stop();
      setIsGenerating(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      setError(message);
      throw e;
    }
  }, []);

  const destroy = useCallback(async () => {
    await stop();

    try {
      await cactusLMRef.current.destroy();
      setIsInitialized(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      setError(message);
      throw e;
    }
  }, [stop]);

  const getModels = useCallback(async () => {
    try {
      return await cactusLMRef.current.getModels();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      setError(message);
      throw e;
    }
  }, []);

  return {
    completion,
    isGenerating,
    isInitialized,
    downloadProgress,
    error,
    download,
    init,
    complete,
    embed,
    stop,
    destroy,
    getModels,
  };
};
