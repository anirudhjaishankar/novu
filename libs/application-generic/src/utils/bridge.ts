import { DigestTypeEnum } from '@novu/shared';
import {
  DigestOutput,
  DigestRegularOutput,
  DigestTimedOutput,
} from '@novu/framework';

export function getDigestType(outputs: DigestOutput): DigestTypeEnum {
  if (isTimedDigestOutput(outputs)) {
    return DigestTypeEnum.TIMED;
  } else if (isLookBackDigestOutput(outputs)) {
    return DigestTypeEnum.BACKOFF;
  }

  return DigestTypeEnum.REGULAR;
}

export const isTimedDigestOutput = (
  outputs: DigestOutput | undefined,
): outputs is DigestTimedOutput => {
  return (outputs as DigestTimedOutput)?.cron != null;
};

export const isLookBackDigestOutput = (
  outputs: DigestOutput,
): outputs is DigestRegularOutput => {
  return (
    (outputs as DigestRegularOutput)?.lookBackWindow?.amount != null &&
    (outputs as DigestRegularOutput)?.lookBackWindow?.unit != null
  );
};

export const isRegularDigestOutput = (
  outputs: DigestOutput,
): outputs is DigestRegularOutput => {
  return !isTimedDigestOutput(outputs) && !isLookBackDigestOutput(outputs);
};

export const BRIDGE_EXECUTION_ERROR = {
  INVALID_BRIDGE_URL: {
    code: 'INVALID_BRIDGE_URL',
    message: (bridgeUrl: string) => `Invalid bridge URL: ${bridgeUrl}`,
  },
  TUNNEL_NOT_FOUND: {
    code: 'TUNNEL_NOT_FOUND',
    message: (url: string) =>
      // eslint-disable-next-line max-len
      `Unable to establish tunnel connection to \`${url}\`. Run npx novu@latest dev in Local mode, or ensure your Tunnel app deployment is available.`,
  },
  BRIDGE_ENDPOINT_NOT_FOUND: {
    code: 'BRIDGE_ENDPOINT_NOT_FOUND',
    message: (url: string) =>
      `Could not connect to Bridge Endpoint at \`${url}\`. Make sure you are running your local app server.`,
  },
  BRIDGE_ENDPOINT_UNAVAILABLE: {
    code: 'BRIDGE_ENDPOINT_UNAVAILABLE',
    message: (url: string) =>
      // eslint-disable-next-line max-len
      `Unable to reach Bridge Endpoint at \`${url}\`. Run npx novu@latest dev in Local mode, or ensure your Bridge app deployment is available.`,
  },
  BRIDGE_METHOD_NOT_CONFIGURED: {
    code: 'BRIDGE_METHOD_NOT_CONFIGURED',
    message: (url: string) =>
      // eslint-disable-next-line max-len
      `Bridge Endpoint at \`${url}\` is not correctly configured. Ensure your \`@novu/framework\` integration exposes the \`POST\`, \`GET\`, and \`OPTIONS\` methods.`,
  },
  BRIDGE_REQUEST_TIMEOUT: {
    code: 'BRIDGE_REQUEST_TIMEOUT',
    message: (url: string) => `Bridge request timeout for \`${url}\``,
  },
  UNSUPPORTED_PROTOCOL: {
    code: 'UNSUPPORTED_PROTOCOL',
    message: (url: string) => `Unsupported protocol for \`${url}\``,
  },
  RESPONSE_READ_ERROR: {
    code: 'RESPONSE_READ_ERROR',
    message: (url: string) => `Response body could not be read for \`${url}\``,
  },
  REQUEST_UPLOAD_ERROR: {
    code: 'REQUEST_UPLOAD_ERROR',
    message: (url: string) => `Error uploading request body for \`${url}\``,
  },
  REQUEST_CACHE_ERROR: {
    code: 'REQUEST_CACHE_ERROR',
    message: (url: string) => `Error caching request for \`${url}\``,
  },
  MAXIMUM_REDIRECTS_EXCEEDED: {
    code: 'MAXIMUM_REDIRECTS_EXCEEDED',
    message: (url: string) => `Maximum redirects exceeded for \`${url}\``,
  },
} satisfies Record<string, { code: string; message: (url: string) => string }>;
