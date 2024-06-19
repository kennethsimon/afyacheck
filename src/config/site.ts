import { env } from "@/env.mjs";
import packageJson from "../package.json";

export type PackageJson = typeof packageJson;
export type SiteConfig = typeof siteConfig;
export type DevConfig = typeof devConfig;

const { version } = packageJson;

export const siteConfig = {
  title: "IHM",
  name: " IHM",
  canonical: "https://ihm.world",
  domain: "https://ihm.world",
  nextUrl: env.NEXT_PUBLIC_APP_URL,
  image:
    "https://storage.googleapis.com/brandflow-bucket/personal/blog/portfolio-og.jpg",
  type: "website",
  twitterHandle: "@ihm_world",
  description:
    "IHM is a platform to help individuals to create their business plans and financial projections.",
  // please don't remove this array, it's used for the auth middleware
  // please don't add "/" to this array, it's already added in the middleware
  additionalPublicPages: [
    "/about",
    "/blog",
    "/blogs",
    "/contact",
    "/privacy-policy",
    "/terms-and-conditions",
  ],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
    logo: "/logo.svg",
  },
  tags: [
    "nextjs",
    "business",
    "tanzania",
    "typescript",
    "eslint",
    "prettier",
    "chadcn-ui",
  ],
  authors: [
    {
      name: "Fredy German Mgimba",
      url: "www.ihm.world",
    },
  ],
  socials: [
    {
      name: "Twitter",
      url: "https://twitter.com/ihm_world_",
      asset: "/twitter.svg",
    },
    {
      name: "Github",
      url: "https://github.com/ihm_world",
      asset: "/github.svg",
    },
    {
      name: "Linkedin",
      url: "https://www.linkedin.com/in/ihm_world/",
      asset: "/linkedin.svg",
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/ihm_world_/",
      asset: "/instagram.svg",
    },
  ],
  contacts: [
    {
      name: "Email",
      url: "mailto:example@gmail.com",
      asset: "/email.svg",
    },
    {
      name: "Phone",
      url: "tel:+1-202-555-0104",
      asset: "/phone.svg",
    },
  ],
  showGitHubBtn: false,
  githubUrl: "https://github.com/ihm_world",
  version: version,
  author: "ihm_world",
  authorUrl: "https://github.com/ihm_world",
  gitHubApiRepoName: "ihm_world/next-js-supabase-starter",
};

export const devConfig = {
  // Add your development config here
  PosthogEnabled: true,
};
