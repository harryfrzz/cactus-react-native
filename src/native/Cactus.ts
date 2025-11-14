import { NitroModules } from 'react-native-nitro-modules';
import type { Cactus as CactusSpec } from '../specs/Cactus.nitro';
import type { Message, Options } from '../types/CactusLM';

export class Cactus {
  private readonly hybridCactus =
    NitroModules.createHybridObject<CactusSpec>('Cactus');

  public init(modelPath: string, contextSize: number): Promise<void> {
    return this.hybridCactus.init(modelPath, contextSize);
  }

  public async complete(
    messages: Message[],
    responseBufferSize: number,
    options?: Options,
    callback?: (token: string, tokenId: number) => void
  ): Promise<{
    success: boolean;
    response: string;
    timeToFirstTokenMs: number;
    totalTimeMs: number;
    tokensPerSecond: number;
    prefillTokens: number;
    decodeTokens: number;
    totalTokens: number;
  }> {
    const messagesJson = JSON.stringify(messages);
    const optionsJson = options
      ? JSON.stringify({
          temperature: options.temperature,
          top_p: options.topP,
          top_k: options.topK,
          max_tokens: options.maxTokens,
          stop_sequences: options.stopSequences,
        })
      : undefined;

    const response = JSON.parse(
      await this.hybridCactus.complete(
        messagesJson,
        responseBufferSize,
        optionsJson,
        undefined,
        callback
      )
    );

    return {
      success: response.success,
      response: response.response,
      timeToFirstTokenMs: response.time_to_first_token_ms,
      totalTimeMs: response.total_time_ms,
      tokensPerSecond: response.tokens_per_second,
      prefillTokens: response.prefill_tokens,
      decodeTokens: response.decode_tokens,
      totalTokens: response.total_tokens,
    };
  }

  public embed(text: string, embeddingBufferSize: number): Promise<number[]> {
    return this.hybridCactus.embed(text, embeddingBufferSize);
  }

  public reset(): Promise<void> {
    return this.hybridCactus.reset();
  }

  public stop(): Promise<void> {
    return this.hybridCactus.stop();
  }

  public destroy(): Promise<void> {
    return this.hybridCactus.destroy();
  }
}
