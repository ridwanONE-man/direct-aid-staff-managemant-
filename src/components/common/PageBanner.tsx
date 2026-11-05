import React from 'react';

// Green page header shared by the portal pages (same look as the Dashboard and Staff Register)
export const bannerButton =
  'inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/25 rounded-xl transition-colors';
export const bannerPrimaryButton =
  'inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#147D4A] bg-white hover:bg-[#EBF7EE] rounded-xl shadow-md transition-colors';

export const BannerStat: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white">
    <span className="block text-[9px] font-bold uppercase tracking-wider text-white/70">{label}</span>
    <span className="block text-sm font-black font-mono leading-tight">{value}</span>
  </div>
);

interface PageBannerProps {
  title: string;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  children?: React.ReactNode; // actions on the right
}

export const PageBanner: React.FC<PageBannerProps> = ({ title, subtitle, badge, children }) => (
  <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#0E6139] via-[#147D4A] to-[#2D9A48] p-6 shadow-[0_20px_50px_-20px_rgba(20,125,74,0.55)]">
    <div className="absolute -top-20 -right-14 w-60 h-60 rounded-full border-[24px] border-white/10 pointer-events-none" />
    <div className="absolute -bottom-24 left-1/3 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
        <img
          src="/directaid-logo-white.png"
          alt="DirectAid - العون المباشر"
          className="h-11 sm:h-12 w-auto object-contain shrink-0 self-start sm:self-auto drop-shadow-sm sm:pr-4 sm:border-r sm:border-white/25"
        />
        <div className="text-white min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{title}</h1>
            {badge !== undefined && badge !== null && (
              <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full">{badge}</span>
            )}
          </div>
          {subtitle && <p className="text-sm text-white/80 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {children && <div className="flex flex-wrap items-center gap-2 shrink-0">{children}</div>}
    </div>
  </div>
);
