const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
