import { ReactNode } from "react";
import { cachedGetSite } from "@/lib/utils";
import { ThemeProvider } from "next-themes";

import {
  Abel,
  Courier_Prime,
  EB_Garamond,
  Gothic_A1,
  Hanken_Grotesk,
  IBM_Plex_Mono,
  Inter,
  Jost,
  Karla,
  Kosugi_Maru,
  Oswald,
  Outfit,
  Schibsted_Grotesk,
  Special_Elite,
  Work_Sans,
  Young_Serif,
  Open_Sans,
} from "next/font/google";

const WorkSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const courierPrime = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const KosugiMaru = Kosugi_Maru({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const SpecialElite = Special_Elite({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["500", "800"],
  display: "swap",
});

const abel = Abel({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const SchibstedGrotesk = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const HankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["600", "800"],
  display: "swap",
});

const YoungSerif = Young_Serif({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const GothicA1 = Gothic_A1({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  display: "swap",
});

const IBMPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "500"],
  display: "swap",
});

const OpenSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "500"],
  display: "swap",
});

const ThemeFonts = {
  Work_Sans: WorkSans.style,
  oswald: oswald.style,
  Courier: courierPrime.style,
  Kosugi_Maru: KosugiMaru.style,
  Special_Elite: SpecialElite.style,
  Inter: inter.style,
  Karla: karla.style,
  EB_Garamond: ebGaramond.style,
  abel: abel.style,
  outfit: outfit.style,
  Schibsted_Grotesk: SchibstedGrotesk.style,
  Hanken_Grotesk: HankenGrotesk.style,
  Young_Serif: YoungSerif.style,
  Gothic_A1: GothicA1.style,
  jost: jost.style,
  IBM_Plex_Mono: IBMPlexMono.style,
  Open_Sans: OpenSans.style,
  default: SchibstedGrotesk.style,
  custom: { fontFamily: "custom" },
};

export const ThemedBody = async ({ children }: { children: ReactNode }) => {
  const { data: site } = await cachedGetSite();

  const templateSettings = (site?.settings?.publicSite?.template?.config ??
    {}) as { themeId: string; fontName: string };

  const { themeId = "default", fontName = "default" } = templateSettings;

  return (
    <ThemeProvider attribute="class" forcedTheme={themeId}>
      <div
        className="flex flex-col sm:flex-row items-start min-h-screen "
        style={
          ThemeFonts[fontName as keyof typeof ThemeFonts] ?? ThemeFonts.default
        }
      >
        {fontName === "custom" && site && (
          <style>
            {`
              @font-face {
                font-family: 'custom';
                src: url('/media/sites/${site.id}/fonts/custom.woff2') format('woff2');
                font-weight: normal;
                font-style: normal;
                font-display: swap;
              }
            `}
          </style>
        )}
        {children}
      </div>
    </ThemeProvider>
  );
};
