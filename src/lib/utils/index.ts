import {
  getEvent as getEventSDK,
  getEvents as getEventsSDK,
  getPage as getPageSDK,
  getPages as getPagesSDK,
  getProduct as getProductSDK,
  getProducts as getProductsSDK,
  getProfileEvents as getProfileEventsSDK,
  getProfile as getProfileSDK,
  getSite as getSiteSDK,
} from "@venuecms/sdk";
import { type ClassValue, clsx } from "clsx";
import { cache } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Cached SDK functions - deduplicates calls within a single request/render
export const cachedGetSite = cache(getSiteSDK);
export const cachedGetEvents = cache(getEventsSDK);
export const cachedGetPage = cache(getPageSDK);
export const cachedGetPages = cache(getPagesSDK);
export const cachedGetProduct = cache(getProductSDK);
export const cachedGetProducts = cache(getProductsSDK);
export const cachedGetProfile = cache(getProfileSDK);
export const cachedGetProfileEvents = cache(getProfileEventsSDK);
export const cachedGetEvent = cache(getEventSDK);
