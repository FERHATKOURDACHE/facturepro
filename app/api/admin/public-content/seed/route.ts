import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  defaultPublicContent,
  PUBLIC_CONTENT_KEY,
} from "@/lib/public-content";

export const dynamic = "force-dynamic";

function unauthorizedResponse() {
  return NextResponse.json(
    {
      ok: false,
      error: "Accès refusé.",
    },
    {
      status: 401,
    }
  );
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";

  if (!authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

export async function POST(request: Request) {
  const expectedSecret = process.env.PUBLIC_CONTENT_ADMIN_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "PUBLIC_CONTENT_ADMIN_SECRET n’est pas configuré. Initialisation bloquée par sécurité.",
      },
      {
        status: 503,
      }
    );
  }

  const token = getBearerToken(request);

  if (!token || token !== expectedSecret) {
    return unauthorizedResponse();
  }

  const content = await prisma.publicContentSetting.upsert({
    where: {
      key: PUBLIC_CONTENT_KEY,
    },
    update: {
      siteConfig: defaultPublicContent.siteConfig,
      pricingContent: defaultPublicContent.pricingContent,
      legalContent: defaultPublicContent.legalContent,
    },
    create: {
      key: PUBLIC_CONTENT_KEY,
      siteConfig: defaultPublicContent.siteConfig,
      pricingContent: defaultPublicContent.pricingContent,
      legalContent: defaultPublicContent.legalContent,
    },
  });

  return NextResponse.json({
    ok: true,
    message: "Contenu public initialisé.",
    key: content.key,
    updatedAt: content.updatedAt,
  });
}
