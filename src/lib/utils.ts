import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function copyToClipboard(content: string) {
  navigator.clipboard.writeText(content)
    .catch((err) => console.error('Failed to copy text: ', err));
}

export interface Metadata {
  name: string;
  image: string;
  symbol: string;
  description?: string;
}
const cache = new Map<string, PromiseWithStatus<Metadata>>();

async function getMetadataFromURL(url: string): Promise<Metadata> {
  const requestOptions = {
    method: "GET",
    redirect: "follow" as RequestRedirect,
  };

  const response = await fetch(url, requestOptions);
  return response.json();
}

export function fetchMetadata(url: string): PromiseWithStatus<Metadata> {
  if (!cache.has(url)) {
    const promise = getMetadataFromURL(url) as PromiseWithStatus<Metadata>;
    promise.status = "pending";
    promise.then(
      (result) => {
        promise.status = "fulfilled";
        promise.value = result;
      },
      (reason) => {
        promise.status = "rejected";
        promise.reason = reason;
      }
    );
    cache.set(url, promise);
  }
  return cache.get(url)!;
}

export type PromiseWithStatus<T> = Promise<T> & {
  status?: "pending" | "fulfilled" | "rejected";
  reason?: unknown;
  value?: T;
};

export function use<T>(promise: PromiseWithStatus<T>): T {
  if (promise.status === "fulfilled") {
    return promise.value as T;
  } else if (promise.status === "rejected") {
    throw promise.reason;
  } else if (promise.status === "pending") {
    throw promise;
  } else {
    throw new Error("Unexpected promise status");
  }
}
