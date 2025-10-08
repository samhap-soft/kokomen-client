// bedrock-flow.service.ts
import { Injectable, Logger } from "@nestjs/common";
import {
  BedrockAgentRuntimeClient,
  InvokeFlowCommand
} from "@aws-sdk/client-bedrock-agent-runtime";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AWSBedrockFlowService {
  private client: BedrockAgentRuntimeClient;
  private readonly region: string = "ap-northeast-2";
  private readonly requestTimeout: number = 60000;
  private readonly logger = new Logger(AWSBedrockFlowService.name);
  constructor(private readonly configService: ConfigService) {
    if (
      !this.configService.get("AWS_ACCESS_KEY_ID") ||
      !this.configService.get("AWS_SECRET_ACCESS_KEY")
    ) {
      throw new Error("AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY is not set");
    }
    this.client = new BedrockAgentRuntimeClient({
      region: this.configService.get("AWS_REGION") || this.region,
      credentials: {
        accessKeyId: this.configService.get("AWS_ACCESS_KEY_ID") as string,
        secretAccessKey: this.configService.get(
          "AWS_SECRET_ACCESS_KEY"
        ) as string
      }
    });
  }

  async invokeFlow(
    flowIdentifier: string,
    flowAliasIdentifier: string,
    input: any
  ) {
    const command = new InvokeFlowCommand({
      flowIdentifier,
      flowAliasIdentifier,
      inputs: [
        {
          content: {
            document: input
          },
          nodeName: "FlowInputNode", // Flow의 입력 노드 이름
          nodeOutputName: "document"
        }
      ]
    });

    const response = await this.client.send(command, {
      requestTimeout: this.requestTimeout
    });

    // 스트리밍 응답 처리
    const results: string[] = [];
    for await (const event of response.responseStream || []) {
      if (event.flowOutputEvent && event.flowOutputEvent.content?.document) {
        results.push(event.flowOutputEvent.content.document as string);
      }
    }

    this.logger.log("results", results[0]);
    return JSON.parse(results[0]);
  }
}
