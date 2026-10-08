"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface MathRendererProps {
  content: string;
  className?: string;
  isBlockMathOnly?: boolean;
}

export function MathRenderer({ content, className = "", isBlockMathOnly = false }: MathRendererProps) {
  const renderedHtml = useMemo(() => {
    if (!content) return "";

    // If explicit single equation / block math mode requested or text starts with raw latex / equation
    if (isBlockMathOnly) {
      try {
        return katex.renderToString(content.trim(), {
          displayMode: true,
          throwOnError: false,
        });
      } catch {
        return `<span class="font-mono text-blue-300">${content}</span>`;
      }
    }

    // Check if the whole string is an equation without $ delimiters
    const isPureEquation = (
      (content.includes("\\frac") ||
       content.includes("\\lim") ||
       content.includes("\\int") ||
       content.includes("\\sum") ||
       content.includes("\\sqrt") ||
       content.includes("\\quad") ||
       content.includes("\\alpha") ||
       content.includes("\\theta") ||
       content.includes("\\partial")) &&
      !content.includes("$")
    );

    if (isPureEquation) {
      try {
        return `<div class="my-3 py-2 px-4 bg-gray-950/70 border border-blue-900/40 rounded-xl overflow-x-auto text-center">${katex.renderToString(
          content.trim(),
          { displayMode: true, throwOnError: false }
        )}</div>`;
      } catch {
        // fallback
      }
    }

    // Replace $$...$$ with block math, and $...$ with inline math
    let processed = content;

    // First replace block math $$ ... $$
    processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      try {
        return `<div class="my-3 py-2 px-4 bg-gray-950/70 border border-blue-900/40 rounded-xl overflow-x-auto text-center">${katex.renderToString(
          math.trim(),
          { displayMode: true, throwOnError: false }
        )}</div>`;
      } catch {
        return `<div class="font-mono text-blue-300">${math}</div>`;
      }
    });

    // Replace inline math $ ... $
    processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), {
          displayMode: false,
          throwOnError: false,
        });
      } catch {
        return `<span class="font-mono text-blue-300">${math}</span>`;
      }
    });

    // Convert newlines to breaks or preserve paragraphs
    return processed.replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>");
  }, [content, isBlockMathOnly]);

  return (
    <div
      className={`leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
