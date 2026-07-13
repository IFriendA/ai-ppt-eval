"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

const markdownLink: Components["a"] = (props) => (
  <a
    href={props.href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue underline underline-offset-2"
  >
    {props.children}
  </a>
);

export default function ChatMarkdown({
  content,
  className = "",
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={`chat-markdown text-sm leading-6 text-zinc-800 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{ a: markdownLink }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
