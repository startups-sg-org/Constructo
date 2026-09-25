import type { SVGProps } from "react";

export default function LogoConstructo(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 44 44" aria-hidden="true" {...props}>
            <path d="M22 2 39.3 12v20L22 42 4.7 32V12L22 2Z" fill="currentColor" />
            <path
                d="M29.7 14.8a10 10 0 1 0 .2 14.2l-4-3.2a5 5 0 1 1-.1-7.7l3.9-3.3Z"
                fill="white"
            />
        </svg>
    );
}
