import type { AnchorHTMLAttributes, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

export function Button({ children, className = "", arrow = true, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; arrow?: boolean }) {
  return <a className={"button " + className} {...props}>{children}{arrow && <ArrowUpRight size={17} aria-hidden="true" />}</a>;
}
