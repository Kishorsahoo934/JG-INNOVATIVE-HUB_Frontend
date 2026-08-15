import { cn } from '@/lib/utils';
import OptimizedImage from '@/components/OptimizedImage';
import { BRAND_LOGO, BRAND_LOGO_WIDTH, BRAND_LOGO_HEIGHT } from '@/constants/media';

export type LogoMarkVariant = 'navDark' | 'navLight' | 'auth' | 'loading';

/** Same clear white tile everywhere (nav, auth, loading): logo.png + consistent plate. */
const navShellClass =
  'flex shrink-0 items-center justify-center rounded-xl bg-white px-1.5 py-1 sm:px-2 sm:py-1.5 shadow-sm ring-1 ring-black/10 min-h-[44px] min-w-[44px]';

const authShellClass =
  'inline-flex items-center justify-center rounded-2xl bg-white p-4 sm:p-5 shadow-sm ring-1 ring-black/10';

const loadingShellClass =
  'relative flex items-center justify-center rounded-2xl bg-white p-7 sm:p-9 shadow-md ring-1 ring-black/10';

/**
 * Same file everywhere: /assets/logo.png. Layout boxes cap max size; object-contain keeps aspect ratio (no stretch).
 */
const shells: Record<LogoMarkVariant, string> = {
  navDark: navShellClass,
  navLight: navShellClass,
  auth: authShellClass,
  loading: loadingShellClass,
};

/** Max box for each context; image scales down uniformly inside (original proportions). */
const imgClass: Record<LogoMarkVariant, string> = {
  navDark:
    'max-h-9 sm:max-h-10 md:max-h-11 w-auto max-w-[3rem] sm:max-w-[3.25rem] md:max-w-[3.5rem] object-contain object-center',
  navLight:
    'max-h-9 sm:max-h-10 md:max-h-11 w-auto max-w-[3rem] sm:max-w-[3.25rem] md:max-w-[3.5rem] object-contain object-center',
  auth: 'max-h-16 sm:max-h-[4.5rem] md:max-h-20 w-auto max-w-[7rem] sm:max-w-[8rem] object-contain object-center',
  loading:
    'relative z-[1] max-h-28 sm:max-h-32 md:max-h-36 w-auto max-w-[min(13rem,90vw)] object-contain object-center',
};

export interface LogoMarkProps {
  variant: LogoMarkVariant;
  priority?: boolean;
  className?: string;
  alt?: string;
}

const LogoMark = ({ variant, priority = false, className, alt = 'Innovative Hub' }: LogoMarkProps) => {
  return (
    <span className={cn(shells[variant], className)}>
      <OptimizedImage
        src={BRAND_LOGO}
        alt={alt}
        priority={priority}
        width={BRAND_LOGO_WIDTH}
        height={BRAND_LOGO_HEIGHT}
        className={imgClass[variant]}
      />
    </span>
  );
};

export default LogoMark;
