import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router-dom";

export function loaderArgs(url: string): LoaderFunctionArgs {
  const request = new Request(url);

  return {
    request,
    url: new URL(url),
    pattern: new URL(url).pathname,
    params: {},
    context: undefined,
  };
}

export function actionArgs(url: string, data: Record<string, string>): ActionFunctionArgs {
  const request = new Request(url, {
    method: "POST",
    body: new URLSearchParams(data),
  });

  return {
    request,
    url: new URL(url),
    pattern: new URL(url).pathname,
    params: {},
    context: undefined,
  };
}
