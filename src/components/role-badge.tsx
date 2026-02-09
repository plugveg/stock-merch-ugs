import { Button } from './ui/button'

export function RoleBadge({ role }: { role: string }) {
  return (
    <Button variant="outline" size="sm" className="pointer-events-none opacity-80">
      {role}
    </Button>
  )
}
