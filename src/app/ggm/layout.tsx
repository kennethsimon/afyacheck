// app/ggm/layout.tsx
export default function ggmLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div>
        <header>
          {/*<h2>ggm</h2>*/}
        </header>
        <main>{children}</main>
      </div>
    );
  }
  