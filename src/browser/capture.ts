import type { Page } from "puppeteer-core/lib/esm/puppeteer/api/Page.js";
import { drawAccessibilityBoxes, removeAccessibilityBoxes } from "../../sidebar/utils/accessibilityOverlay";

export interface CapturedPage {
  accessibilityTree: unknown;
  screenshot?: string;
  nodeMap: Map<string, any>;
}

export async function capturePage(page: Page, includeScreenshot: boolean): Promise<CapturedPage> {
  const accessibilityTree = await page.accessibility.snapshot();
  const nodeMap = new Map<string, any>();

  if (accessibilityTree) {
    mapNodes(accessibilityTree, nodeMap);
  }

  let screenshot: string | undefined;
  if (includeScreenshot && accessibilityTree) {
    try {
      await drawAccessibilityBoxes(page, accessibilityTree);
      screenshot = (await page.screenshot({
        encoding: "base64",
        type: "png",
      })) as string;
    } finally {
      await removeAccessibilityBoxes(page);
    }
  }

  return { accessibilityTree, screenshot, nodeMap };
}

function mapNodes(node: any, nodeMap: Map<string, any>): void {
  if (!node || typeof node !== "object") return;
  if (node.id !== undefined && node.id !== null) {
    nodeMap.set(String(node.id), node);
  }
  if (Array.isArray(node.children)) {
    node.children.forEach((child: unknown) => mapNodes(child, nodeMap));
  }
}
