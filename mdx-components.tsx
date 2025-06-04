import { A as a } from "@/components/mdx/a"
import { P as p } from "@/components/mdx/p"
import { H1 as h1 } from "@/components/mdx/h1"
import { H2 as h2 } from "@/components/mdx/h2"
import { H3 as h3 } from "@/components/mdx/h3"
import { OL as ol } from "@/components/mdx/ol"
import { UL as ul } from "@/components/mdx/ul"
import { LI as li } from "@/components/mdx/li"
import { HR as hr } from "@/components/mdx/hr"
import { Image } from "@/components/mdx/image"
import { Code as code } from "@/components/mdx/code"
import { Figure } from "@/components/mdx/figure"
import { Snippet } from "@/components/mdx/snippet"
import { Caption } from "@/components/mdx/caption"
import { Callout } from "@/components/mdx/callout"
import { Ref, FootNotes, FootNote } from "@/components/mdx/footnotes"
import { Blockquote as blockquote } from "@/components/mdx/blockquote"

export function useMDXComponents(components: {
  [component: string]: React.ComponentType;
}) {
  return {
    ...components,
    a,
    h1, 
    h2,
    h3,
    p,
    ol,
    ul,
    li,
    hr,
    Image,
    code,
    pre: Snippet,
    blockquote,
    Figure,
    Snippet,
    Caption,
    Callout,
    Ref,
    FootNotes,
    FootNote,
  };
}
