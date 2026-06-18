import { prisma } from "@/lib/prisma";
import { legalContent } from "@/lib/legal-content";
import { pricingContent } from "@/lib/pricing-content";
import { siteConfig } from "@/lib/site-config";

export const PUBLIC_CONTENT_KEY = "default";

export type PublicContent = {
  siteConfig: typeof siteConfig;
  pricingContent: typeof pricingContent;
  legalContent: typeof legalContent;
};

export const defaultPublicContent: PublicContent = {
  siteConfig,
  pricingContent,
  legalContent,
};

export async function getPublicContent(): Promise<PublicContent> {
  try {
    const content = await prisma.publicContentSetting.findUnique({
      where: {
        key: PUBLIC_CONTENT_KEY,
      },
    });

    if (!content) {
      return defaultPublicContent;
    }

    return {
      siteConfig: (content.siteConfig ?? siteConfig) as typeof siteConfig,
      pricingContent: (content.pricingContent ?? pricingContent) as typeof pricingContent,
      legalContent: (content.legalContent ?? legalContent) as typeof legalContent,
    };
  } catch {
    return defaultPublicContent;
  }
}
