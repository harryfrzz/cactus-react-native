import { CactusUtil } from '../native';
import { version as packageVersion } from '../../package.json';
import type { DeviceInfo } from '../specs/CactusDeviceInfo.nitro';
import type { CactusModel } from '../types/CactusLM';
import type { LogRecord } from '../telemetry/Telemetry';

export class Database {
  private static readonly url = 'https://vlqqczxwyaodtcdmdmlw.supabase.co';
  private static readonly key =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZscXFjenh3eWFvZHRjZG1kbWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MTg2MzIsImV4cCI6MjA2NzA5NDYzMn0.nBzqGuK9j6RZ6mOPWU2boAC_5H9XDs-fPpo5P3WZYbI';

  public static async sendLogRecords(records: LogRecord[]): Promise<void> {
    const response = await fetch(`${this.url}/rest/v1/logs`, {
      method: 'POST',
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': 'application/json',
        'Content-Profile': 'cactus',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(records),
    });

    if (!response.ok) {
      throw new Error('Sending logs failed');
    }
  }

  public static async registerDevice(device_data: DeviceInfo): Promise<string> {
    const response = await fetch(
      `${this.url}/functions/v1/device-registration`,
      {
        method: 'POST',
        body: JSON.stringify({ device_data }),
      }
    );

    if (!response.ok) {
      throw new Error('Registering device failed');
    }

    return await CactusUtil.registerApp(await response.text());
  }

  public static async getModels(): Promise<CactusModel[]> {
    const response = await fetch(
      `${this.url}/functions/v1/get-models?sdk_name=react&sdk_version=${packageVersion}-beta`,
      {
        headers: { apikey: this.key, Authorization: `Bearer ${this.key}` },
      }
    );

    if (!response.ok) {
      throw new Error('Getting models failed');
    }

    return (await response.json()) as CactusModel[];
  }
}
