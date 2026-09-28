import type { SVGProps } from "react";

/** Iconografía de línea fina coherente con el loto de la marca. */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 24, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export const DropIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3.5c3.6 4.6 5.6 8 5.6 10.4a5.6 5.6 0 0 1-11.2 0C6.4 11.5 8.4 8.1 12 3.5Z" />
    <path d="M9.4 14.6a2.7 2.7 0 0 0 2.4 2.3" />
  </Base>
);

export const HeartIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 19.5s-7.5-4.4-7.5-10A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.5 2.3c0 5.6-7.5 10-7.5 10Z" />
  </Base>
);

export const SparkleIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3.5c.6 4.3 2.2 5.9 6.5 6.5-4.3.6-5.9 2.2-6.5 6.5-.6-4.3-2.2-5.9-6.5-6.5 4.3-.6 5.9-2.2 6.5-6.5Z" />
    <path d="M18.5 15.5c.2 1.5.8 2.1 2.3 2.3-1.5.2-2.1.8-2.3 2.3-.2-1.5-.8-2.1-2.3-2.3 1.5-.2 2.1-.8 2.3-2.3Z" />
  </Base>
);

export const LotusIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 17c-3.3-3-3.2-8.4 0-12.2 3.2 3.8 3.3 9.2 0 12.2Z" />
    <path d="M12 17c-3.6-.3-6.6-3-7.3-7.7 3.5.6 6.3 2.8 7.3 7.7Zm0 0c3.6-.3 6.6-3 7.3-7.7-3.5.6-6.3 2.8-7.3 7.7Z" />
    <path d="M6 19.5c4 1.4 8 1.4 12 0" />
  </Base>
);

export const FaceIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3.5c-4 0-6.5 3-6.5 7.3 0 4.6 3 9.7 6.5 9.7s6.5-5.1 6.5-9.7c0-4.3-2.5-7.3-6.5-7.3Z" />
    <path d="M9 11.2c.5.5 1 .5 1.5 0M13.5 11.2c.5.5 1 .5 1.5 0M10.5 15.6c1 .6 2 .6 3 0" />
  </Base>
);

export const BodyIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 3.5c-.8 3 .2 5.2 1 7-1.8 2.2-2.5 5-1.6 9M15 3.5c.8 3-.2 5.2-1 7 1.8 2.2 2.5 5 1.6 9" />
    <path d="M10 10.5c1.3.6 2.7.6 4 0" />
  </Base>
);

export const NailsIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 20.5v-9a2.5 2.5 0 0 1 5 0v9M12 20.5v-11a2.5 2.5 0 0 1 5 0v11" />
    <path d="M8 11.5c.3-.9 1.9-.9 2.8 0M13 9.5c.3-.9 1.9-.9 2.8 0" />
  </Base>
);

export const FootIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M9.5 20.5c-2.2 0-3.4-1.8-3-4.3.5-3.2 1.3-5.6 1.3-8.2 0-2.2 1.3-3.5 3.2-3.5 2.4 0 3.3 2 3 4.6-.4 3.2-.2 5.6.6 7.4 1 2.4-1.3 4-5.1 4Z" />
    <circle cx="15.8" cy="5" r=".9" />
    <circle cx="17.6" cy="7.3" r=".8" />
    <circle cx="18.4" cy="10" r=".7" />
  </Base>
);

export const LaserIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4M6 6l2.6 2.6M15.4 15.4 18 18M18 6l-2.6 2.6M8.6 15.4 6 18" />
    <circle cx="12" cy="12" r="2.2" />
  </Base>
);

export const LeafIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Z" />
    <path d="M5 19c3-4 6-7 10-10" />
  </Base>
);

export const HandIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M7.5 12.5V7a1.5 1.5 0 0 1 3 0v4.5M10.5 11V5.5a1.5 1.5 0 0 1 3 0V11M13.5 11V6.5a1.5 1.5 0 0 1 3 0v6c0 4.4-2.6 8-6.5 8-2.6 0-4.1-1.3-5.6-3.6L3 14.2a1.5 1.5 0 0 1 2.4-1.8l2.1 2.2" />
  </Base>
);

export const ShieldIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3.5 19 6v5.6c0 4.3-3 7.7-7 8.9-4-1.2-7-4.6-7-8.9V6l7-2.5Z" />
    <path d="m9 12 2.1 2.1L15.3 10" />
  </Base>
);

export const ClockIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Base>
);

export const PinIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  </Base>
);

export const PhoneIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6.6 3.8 9 4.4l1.2 3.7-1.8 1.4a11.5 11.5 0 0 0 6.1 6.1l1.4-1.8 3.7 1.2.6 2.4c.2 1-.5 2-1.6 2.1C10.6 20 4 13.4 4.5 5.4c.1-1.1 1.1-1.8 2.1-1.6Z" />
  </Base>
);

export const MailIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </Base>
);

export const ArrowIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14M13.5 6.5 19 12l-5.5 5.5" />
  </Base>
);

export const ChevronIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m9 6 6 6-6 6" />
  </Base>
);

export const StarIcon = (p: IconProps) => (
  <Base {...p} fill="currentColor" stroke="none">
    <path d="m12 3.8 2.4 5 5.4.6-4 3.7 1.1 5.4L12 15.8l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6 2.4-5Z" />
  </Base>
);

export const QuoteIcon = (p: IconProps) => (
  <Base {...p} fill="currentColor" stroke="none">
    <path d="M9.6 6C6.4 7.3 4.5 9.9 4.5 13.4c0 2.7 1.6 4.6 3.8 4.6 1.9 0 3.3-1.4 3.3-3.2 0-1.8-1.3-3.1-3-3.1-.3 0-.6 0-.8.1.3-1.7 1.6-3.2 3.4-4.1L9.6 6Zm8 0c-3.2 1.3-5.1 3.9-5.1 7.4 0 2.7 1.6 4.6 3.8 4.6 1.9 0 3.3-1.4 3.3-3.2 0-1.8-1.3-3.1-3-3.1-.3 0-.6 0-.8.1.3-1.7 1.6-3.2 3.4-4.1L17.6 6Z" />
  </Base>
);

export const MenuIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 8h16M4 16h10" />
  </Base>
);

export const CloseIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
);

export const WhatsAppIcon = ({ size = 24, ...rest }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...rest}>
    <path d="M12.04 2.5a9.44 9.44 0 0 0-8.1 14.3L2.6 21.5l4.83-1.27A9.44 9.44 0 1 0 12.04 2.5Zm0 17.2a7.8 7.8 0 0 1-3.97-1.09l-.28-.17-2.87.75.77-2.8-.19-.29a7.78 7.78 0 1 1 6.54 3.6Zm4.27-5.83c-.23-.12-1.38-.68-1.6-.76-.21-.08-.37-.12-.52.12-.16.23-.6.76-.74.91-.13.16-.27.18-.5.06a6.37 6.37 0 0 1-3.17-2.77c-.24-.41.24-.38.69-1.27.08-.15.04-.29-.02-.4-.06-.12-.52-1.26-.72-1.72-.19-.45-.38-.39-.52-.4h-.45a.86.86 0 0 0-.62.3 2.6 2.6 0 0 0-.81 1.93c0 1.14.83 2.24.95 2.4.11.15 1.63 2.49 3.95 3.49 1.47.63 2.04.69 2.78.58.45-.07 1.38-.57 1.58-1.11.19-.55.19-1.01.13-1.11-.05-.1-.21-.16-.44-.28Z" />
  </svg>
);

export const FacebookIcon = ({ size = 24, ...rest }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...rest}>
    <path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1Z" />
  </svg>
);

export const InstagramIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r=".6" fill="currentColor" />
  </Base>
);

export const categoryIcons = {
  face: FaceIcon,
  body: BodyIcon,
  nails: NailsIcon,
  foot: FootIcon,
  laser: LaserIcon,
} as const;

export const valueIcons = {
  drop: DropIcon,
  heart: HeartIcon,
  sparkle: SparkleIcon,
  lotus: LotusIcon,
} as const;
