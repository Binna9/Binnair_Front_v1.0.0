import ThemeToggle from '@/components/ThemeToggle';

export default function Navbar() {
  return (
    <nav className="bg-background shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-foreground">My App</h1>
      <ThemeToggle />
    </nav>
  );
}
