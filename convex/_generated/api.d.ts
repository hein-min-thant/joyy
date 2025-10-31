/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admins from "../admins.js";
import type * as analytics from "../analytics.js";
import type * as bannedUsers from "../bannedUsers.js";
import type * as chapterAccess from "../chapterAccess.js";
import type * as chapterPurchases from "../chapterPurchases.js";
import type * as chapters from "../chapters.js";
import type * as coinPackages from "../coinPackages.js";
import type * as comics from "../comics.js";
import type * as favorites from "../favorites.js";
import type * as featured from "../featured.js";
import type * as notifications from "../notifications.js";
import type * as pages from "../pages.js";
import type * as purchases from "../purchases.js";
import type * as readingHistory from "../readingHistory.js";
import type * as readingProgress from "../readingProgress.js";
import type * as reservedUsernames from "../reservedUsernames.js";
import type * as reviews from "../reviews.js";
import type * as userProfiles from "../userProfiles.js";
import type * as wallets from "../wallets.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admins: typeof admins;
  analytics: typeof analytics;
  bannedUsers: typeof bannedUsers;
  chapterAccess: typeof chapterAccess;
  chapterPurchases: typeof chapterPurchases;
  chapters: typeof chapters;
  coinPackages: typeof coinPackages;
  comics: typeof comics;
  favorites: typeof favorites;
  featured: typeof featured;
  notifications: typeof notifications;
  pages: typeof pages;
  purchases: typeof purchases;
  readingHistory: typeof readingHistory;
  readingProgress: typeof readingProgress;
  reservedUsernames: typeof reservedUsernames;
  reviews: typeof reviews;
  userProfiles: typeof userProfiles;
  wallets: typeof wallets;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
