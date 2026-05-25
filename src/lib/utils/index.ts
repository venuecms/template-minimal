import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cache } from "react";
import {
  getSite as getSiteSDK,
  getEvents as getEventsSDK,
  getPage as getPageSDK,
  getPages as getPagesSDK,
  getProduct as getProductSDK,
  getProducts as getProductsSDK,
  getProfile as getProfileSDK,
  getProfileEvents as getProfileEventsSDK,
  getEvent as getEventSDK,
  getNews as getNewsSDK,
  getNewsArticle as getNewsArticleSDK,
  getNewsDates as getNewsDatesSDK,
} from "@venuecms/sdk";

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
export const cachedGetNews = cache(getNewsSDK);
export const cachedGetNewsArticle = cache(getNewsArticleSDK);
export const cachedGetNewsDates = cache(getNewsDatesSDK);
