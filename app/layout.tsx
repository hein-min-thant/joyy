import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Footer } from "@/components/Footer";
import { BanCheck } from "@/components/BanCheck";
import { Toaster } from "sonner";

export const metadata: Metadata = {
    title: "JOYY",
    description: "Read your favorite manga and comics",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider>
            <html lang="en" suppressHydrationWarning className={GeistSans.variable}>
                <body className={`${GeistSans.className} antialiased flex flex-col min-h-screen`}>
                    <ThemeProvider>
                        <ConvexClientProvider>
                            <HeroUIProvider>
                                <BanCheck />
                                <div className="flex-1 flex flex-col">
                                    {children}
                                </div>
                                <Footer />
                                <Toaster
                                    richColors
                                    position="top-right"
                                    toastOptions={{
                                        style: {
                                            fontFamily: GeistSans.style.fontFamily,
                                        }
                                    }}
                                />
                            </HeroUIProvider>
                        </ConvexClientProvider>
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
