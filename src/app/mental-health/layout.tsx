// app/mental-health/layout.tsx
export default function MentalHealthLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div>
        <header>
          {/*<h2>Mental Health Hub</h2>*/}
        </header>
        <main>{children}</main>
      </div>
    );
  }
  