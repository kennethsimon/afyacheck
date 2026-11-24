// app/kijana-togora/layout.tsx
export default function KijanaTogoraLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div>
        <header>
          {/*<h2>kijana togora</h2>*/}
        </header>
        <main>{children}</main>
      </div>
    );
  }
  