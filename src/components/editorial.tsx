import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ComponentType,
  ReactNode,
} from "react";
import {
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  Bell,
  CalendarSync,
  History,
  LayoutDashboard,
  Mail,
  Settings2,
  Wallet,
} from "lucide-react";
import { getGoogleCalendarAuthUrl } from "@/lib/backend";

export type NavKey =
  | "dashboard"
  | "inbox"
  | "rates"
  | "income"
  | "migration"
  | "reports"
  | "parameters";

type ShellProps = {
  active: NavKey;
  eyebrow?: string;
  title: string;
  actions?: ReactNode;
  children: ReactNode;
};

type ActionButtonBaseProps = {
  children: ReactNode;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  className?: string;
};

type ActionButtonAsButton = ActionButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type ActionButtonAsLink = ActionButtonBaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type ActionButtonProps = ActionButtonAsButton | ActionButtonAsLink;

type MetricCardProps = {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  helper?: string;
  accent?: "default" | "amber";
  className?: string;
  contentClassName?: string;
  valueClassName?: string;
  labelClassName?: string;
  helperClassName?: string;
  iconClassName?: string;
};

type SectionFrameProps = {
  children: ReactNode;
  className?: string;
};

type FilterFieldProps = {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

type StatusBadgeProps = {
  children: ReactNode;
  tone?:
    | "confirmed"
    | "pending"
    | "billable"
    | "archived"
    | "review"
    | "danger"
    | "muted";
  className?: string;
};

type AvatarProps = {
  initials: string;
  size?: "sm" | "md";
};

const navItems: Array<{
  id: NavKey;
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { id: "dashboard", href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { id: "inbox", href: "/inbox", label: "Pendientes", icon: Mail },
  { id: "rates", href: "/rates", label: "Tarifas", icon: BadgeDollarSign },
  { id: "income", href: "/income", label: "Ingresos", icon: Wallet },
  { id: "migration", href: "/migration", label: "Historial", icon: History },
  { id: "reports", href: "/reports", label: "Reportes", icon: BarChart3 },
  { id: "parameters", href: "/parameters", label: "Consultoras", icon: Settings2 },
];

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function DashboardShell({
  active,
  eyebrow,
  title,
  actions,
  children,
}: ShellProps) {
  return (
    <div className="min-h-dvh bg-background text-on-surface">
      <aside className="paper-panel fixed inset-y-0 left-0 hidden w-72 flex-col bg-surface-container-low px-5 py-8 lg:flex">
        <div className="px-4">
          <p className="font-headline text-3xl font-bold text-primary">Afazio Atelier</p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-on-surface-variant/65">
            Backoffice académico
          </p>
        </div>

        <nav className="mt-10 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium",
                  item.id === active
                    ? "bg-surface-container-highest text-primary"
                    : "text-on-surface-variant hover:bg-surface-container-highest/70 hover:text-primary",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4 px-1">
          <div className="rounded-2xl bg-surface-container-high p-4">
            <div className="flex items-center gap-3">
              <Avatar initials="AF" />
              <div>
                <p className="text-sm font-semibold text-primary">Prof. Afazio</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/75">
                  Director académico
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 border-b border-outline-variant/25 bg-surface/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1500px] items-start justify-between gap-6 px-5 py-5 sm:px-8 xl:px-12">
            <div className="min-w-0">
              {eyebrow ? (
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-on-surface-variant/70">
                  {eyebrow}
                </p>
              ) : null}
              <h1 className="mt-1 text-balance font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                {title}
              </h1>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden items-center gap-2 xl:flex">{actions}</div>
              <div className="hidden h-5 w-px bg-outline-variant/35 xl:block" />
              <IconButton label="Notificaciones">
                <Bell className="h-4 w-4" />
              </IconButton>
              <IconButton label="Configuración">
                <Settings2 className="h-4 w-4" />
              </IconButton>
              <Avatar initials="AF" size="sm" />
            </div>
          </div>

          <div className="border-t border-outline-variant/20 px-5 py-3 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]",
                    item.id === active
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-high text-on-surface-variant",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 xl:px-12">{children}</main>
      </div>
    </div>
  );
}

export function PageActions() {
  const connectHref = getGoogleCalendarAuthUrl();

  return (
    <>
      <ActionButton
        href={connectHref}
        variant="outline"
        className="border-[#4f7f5f]/30 bg-surface-container-lowest text-[#3f6a4d] hover:bg-[#eef5ee] hover:text-[#31543d]"
        icon={<CalendarSync className="h-3.5 w-3.5" />}
      >
        Conectar calendario
      </ActionButton>
    </>
  );
}

export function ActionButton({
  children,
  icon,
  variant = "ghost",
  className,
  ...props
}: ActionButtonProps) {
  const variants = {
    primary:
      "bg-primary text-on-primary hover:opacity-92 shadow-[0_16px_28px_rgb(6_27_14_/_0.14)]",
    secondary: "bg-secondary-container text-on-secondary-container hover:bg-surface-container-highest",
    outline: "border border-outline-variant/50 bg-surface-container-lowest text-on-surface-variant hover:text-primary",
    ghost: "text-on-surface-variant hover:bg-surface-container-high hover:text-primary",
  };
  const classes = cn(
    "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em]",
    variants[variant],
    "disabled:pointer-events-none disabled:opacity-55",
    className,
  );

  if ("href" in props && props.href) {
    const { href, target, rel, ...anchorProps } = props;

    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={classes}
        {...anchorProps}
      >
        {icon}
        <span>{children}</span>
      </a>
    );
  }

  const buttonProps = props as ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button
      type={buttonProps.type ?? "button"}
      className={classes}
      {...buttonProps}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

export function IconButton({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high"
    >
      {children}
    </button>
  );
}

export function MetricCard({
  label,
  value,
  icon,
  helper,
  accent = "default",
  className,
  contentClassName,
  valueClassName,
  labelClassName,
  helperClassName,
  iconClassName,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "paper-panel flex h-[156px] flex-col rounded-[1.4rem] bg-surface-container-lowest p-6",
        className,
      )}
    >
      <div className="flex min-h-[2.35rem] items-start">
        <p
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.25em] text-on-surface-variant/70",
            labelClassName,
          )}
        >
          {label}
        </p>
      </div>
      <div className={cn("mt-8 flex items-end justify-between gap-5", contentClassName)}>
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              "font-headline text-5xl font-bold tracking-tight text-primary",
              accent === "amber" && "text-[#c28532]",
              valueClassName,
            )}
          >
            {value}
          </div>
          {helper ? (
            <p className={cn("mt-2 text-xs text-on-surface-variant/70", helperClassName)}>
              {helper}
            </p>
          ) : null}
        </div>
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-container-high text-primary/60",
            accent === "amber" && "bg-[#fde9cf] text-[#ad6e24]",
            iconClassName,
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export function SectionFrame({ children, className }: SectionFrameProps) {
  return (
    <section
      className={cn(
        "paper-panel rounded-[1.5rem] bg-surface-container-low p-6 sm:p-8",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function FilterField({
  label,
  icon,
  children,
  className,
}: FilterFieldProps) {
  return (
    <label className={cn("flex min-w-[220px] flex-1 flex-col gap-2", className)}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant/75">
        {label}
      </span>
      <span className="flex items-center gap-3 border-b-2 border-outline-variant bg-surface-container-lowest px-3 py-3 text-sm text-on-surface">
        {icon}
        {children}
      </span>
    </label>
  );
}

export function StatusBadge({
  children,
  tone = "muted",
  className,
}: StatusBadgeProps) {
  const tones = {
    confirmed: "bg-[#bcdab8] text-[#15361a]",
    pending: "bg-[#f6e1a9] text-[#7a5400]",
    billable: "bg-[#d7e8ff] text-[#184c84]",
    archived: "bg-secondary-container text-on-secondary-container",
    review: "bg-[#fde9cf] text-[#8f5a16]",
    danger: "bg-[#ffdad6] text-[#8e1212]",
    muted: "bg-surface-container-high text-on-surface-variant",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Avatar({ initials, size = "md" }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-[#f3c98b] font-semibold text-primary",
        size === "md" ? "h-11 w-11 text-sm" : "h-10 w-10 text-xs",
      )}
    >
      {initials}
    </div>
  );
}

export function MobileTableHint() {
  return (
    <div className="mb-4 flex items-center justify-between rounded-2xl bg-surface-container-high px-4 py-3 text-xs text-on-surface-variant md:hidden">
      <span>Scroll horizontally for the full ledger</span>
      <ArrowRight className="h-4 w-4" />
    </div>
  );
}

export function PageFooterNote({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant/65">
      {children}
    </p>
  );
}
