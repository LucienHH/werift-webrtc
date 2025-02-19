import {
  DepacketizeBase,
  type DepacketizerInput,
  type DepacketizerOutput,
} from "./depacketizer";
import { SimpleProcessorCallbackBase } from "./interface";

export class DepacketizeCallback extends SimpleProcessorCallbackBase<
  DepacketizerInput,
  DepacketizerOutput,
  typeof DepacketizeBase
>(DepacketizeBase) {}
