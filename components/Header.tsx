import Link from "next/link"

export default function Header() {
  return (
    <header className="border-b border-agi-border">
      <div className="mx-auto flex items-center justify-center py-4">
        <div className="flex items-center">
          <div className="relative mr-2 h-8 w-8">
            <div className="absolute inset-0 rounded-full bg-agi-blue"></div>
            <div className="absolute inset-[3px] rounded-full bg-agi-green"></div>
          </div>
          <span className="text-lg font-bold">AGI Auto Builder</span>
        </div>
        <nav className="ml-8 flex space-x-6">
          <Link href="#" className="text-white hover:text-agi-blue">
            Home
          </Link>
          <Link href="#" className="text-white hover:text-agi-blue">
            Features
          </Link>
          <Link href="#" className="text-white hover:text-agi-blue">
            Docs
          </Link>
          <Link href="#" className="text-white hover:text-agi-blue">
            Login
          </Link>
        </nav>
      </div>
    </header>
  )
}
