import { Cactus, CactusFileSystem } from '../native';
import type {
  CactusDownloadParams,
  CactusInitParams,
  CactusCompletionParams,
  CactusCompletionResult,
  CactusEmbeddingParams,
  CactusEmbeddingResult,
  CactusModel,
} from '../types/CactusLM';
import { Telemetry } from '../telemetry/Telemetry';
import { CactusConfig } from '../config/CactusConfig';
import { Database } from '../api/Database';

export class CactusLM {
  private readonly cactus = new Cactus();

  private static readonly defaultModel = 'qwen3-0.6';
  private static readonly defaultContextSize = 2048;
  private static readonly defaultCompletionOptions = {
    maxTokens: 512,
  };
  private static readonly defaultEmbeddingBufferSize = 2048;

  private initialized: { model: string; contextSize: number } | null = null;

  public async download({
    model,
    onProgress,
  }: CactusDownloadParams = {}): Promise<void> {
    model = model ?? CactusLM.defaultModel;

    if (await CactusFileSystem.modelExists(model)) {
      onProgress?.(1.0);
      return;
    }

    return CactusFileSystem.downloadModel(model, onProgress);
  }

  public async init({
    model,
    contextSize,
  }: CactusInitParams = {}): Promise<void> {
    if (!Telemetry.isInitialized()) {
      await Telemetry.init(CactusConfig.telemetryToken);
    }

    model = model ?? CactusLM.defaultModel;
    contextSize = contextSize ?? CactusLM.defaultContextSize;

    if (
      this.initialized?.model === model &&
      this.initialized?.contextSize === contextSize
    ) {
      return;
    }

    if (this.initialized) {
      await this.cactus.destroy();
    }

    await this.download({ model });

    try {
      await this.cactus.init(
        await CactusFileSystem.getModelPath(model),
        contextSize
      );
      Telemetry.logInit(model, true);
      this.initialized = { model, contextSize };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Telemetry.logInit(model, false, message);
      throw error;
    }
  }

  public async complete({
    messages,
    options,
    onToken,
    model,
    contextSize,
  }: CactusCompletionParams): Promise<CactusCompletionResult> {
    model = model ?? this.initialized?.model ?? CactusLM.defaultModel;
    contextSize =
      contextSize ??
      this.initialized?.contextSize ??
      CactusLM.defaultContextSize;
    options = {
      ...CactusLM.defaultCompletionOptions,
      ...options,
    };

    await this.init({ model, contextSize });

    const responseBufferSize =
      8 * (options.maxTokens ?? CactusLM.defaultCompletionOptions.maxTokens) +
      256;
    try {
      const result = await this.cactus.complete(
        messages,
        responseBufferSize,
        options,
        onToken
      );
      Telemetry.logCompletion(
        model,
        result.success,
        result.success ? undefined : result.response,
        result
      );
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Telemetry.logCompletion(model, false, message);
      throw error;
    }
  }

  public async embed({
    text,
    model,
  }: CactusEmbeddingParams): Promise<CactusEmbeddingResult> {
    model = model ?? this.initialized?.model ?? CactusLM.defaultModel;

    await this.init({ model });

    try {
      const embedding = await this.cactus.embed(
        text,
        CactusLM.defaultEmbeddingBufferSize
      );
      Telemetry.logEmbedding(model, true);
      return { embedding };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Telemetry.logEmbedding(model, false, message);
      throw error;
    }
  }

  public stop(): Promise<void> {
    return this.cactus.stop();
  }

  public async destroy(): Promise<void> {
    await this.cactus.destroy();
    this.initialized = null;
  }

  public async getModels(): Promise<CactusModel[]> {
    return Database.getModels();
  }
}
