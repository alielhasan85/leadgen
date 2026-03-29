'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import {
  IconLayoutDashboard,
  IconSearch,
  IconBuilding,
  IconMail,
  IconRocket,
  IconAddressBook,
  IconChartBar,
  IconUser,
  IconFiles,
  IconCreditCard,
  IconChevronDown,
  IconArrowNarrowLeft,
  IconMenu2,
  IconX,
  IconLogout,
  IconSettings,
} from '@tabler/icons-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavLink {
  label: string
  href: string
  icon: React.ReactNode
}

interface NavGroup {
  id: string
  label: string
  icon: React.ReactNode
  links: NavLink[]
}

interface SidebarUser {
  name?: string | null
  email?: string | null
  image?: string | null
}

// ─── Context ─────────────────────────────────────────────────────────────────

const SidebarContext = createContext<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}>({ open: true, setOpen: () => {} })

const useSidebar = () => useContext(SidebarContext)

// ─── Navigation config ───────────────────────────────────────────────────────

const iconCls = 'size-5 shrink-0'

const primaryLinks: NavLink[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <IconLayoutDashboard className={iconCls} /> },
  { label: 'Discover', href: '/discover', icon: <IconSearch className={iconCls} /> },
  { label: 'My Leads', href: '/leads', icon: <IconBuilding className={iconCls} /> },
  { label: 'Outreach', href: '/outreach', icon: <IconMail className={iconCls} /> },
]

const groups: NavGroup[] = [
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: <IconRocket className={iconCls} />,
    links: [
      { label: 'Campaigns', href: '/campaigns', icon: <IconRocket className={iconCls} /> },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    icon: <IconAddressBook className={iconCls} />,
    links: [
      { label: 'Contacts', href: '/contacts', icon: <IconAddressBook className={iconCls} /> },
    ],
  },
  {
    id: 'reporting',
    label: 'Reporting',
    icon: <IconChartBar className={iconCls} />,
    links: [
      { label: 'Analytics', href: '/analytics', icon: <IconChartBar className={iconCls} /> },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <IconSettings className={iconCls} />,
    links: [
      { label: 'Business Profile', href: '/settings/profile', icon: <IconUser className={iconCls} /> },
      { label: 'Materials', href: '/settings/materials', icon: <IconFiles className={iconCls} /> },
      { label: 'Billing', href: '/settings/billing', icon: <IconCreditCard className={iconCls} /> },
    ],
  },
]

// ─── Main export ─────────────────────────────────────────────────────────────

export default function AppSidebar({ user }: { user: SidebarUser }) {
  const [open, setOpen] = useState(true)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    pipeline: true, data: false, reporting: false, settings: false,
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedOpen = localStorage.getItem('lg-sidebar-open')
    const savedGroups = localStorage.getItem('lg-sidebar-groups')
    if (savedOpen !== null) setOpen(savedOpen === 'true')
    if (savedGroups !== null) {
      try { setExpandedGroups(JSON.parse(savedGroups)) } catch {}
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) localStorage.setItem('lg-sidebar-open', String(open))
  }, [open, mounted])

  useEffect(() => {
    if (mounted) localStorage.setItem('lg-sidebar-groups', JSON.stringify(expandedGroups))
  }, [expandedGroups, mounted])

  const toggleGroup = (id: string) =>
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      <DesktopSidebar open={open} setOpen={setOpen} expandedGroups={expandedGroups} toggleGroup={toggleGroup} user={user} />
      <MobileSidebar expandedGroups={expandedGroups} toggleGroup={toggleGroup} user={user} />
    </SidebarContext.Provider>
  )
}

// ─── Desktop sidebar ─────────────────────────────────────────────────────────

function DesktopSidebar({ open, setOpen, expandedGroups, toggleGroup, user }: {
  open: boolean
  setOpen: (v: boolean) => void
  expandedGroups: Record<string, boolean>
  toggleGroup: (id: string) => void
  user: SidebarUser
}) {
  return (
    <motion.div
      animate={{ width: open ? 240 : 64 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="group/sidebar relative hidden md:flex flex-col h-screen shrink-0 bg-white border-r border-zinc-200 px-3 py-4 overflow-hidden"
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="absolute -right-2.5 top-5 z-40 hidden size-5 items-center justify-center rounded-sm border border-zinc-200 bg-white group-hover/sidebar:flex"
      >
        <IconArrowNarrowLeft className={cn('size-3 text-zinc-500 transition-transform duration-300', !open && 'rotate-180')} />
      </button>

      {/* Logo */}
      <div className="mb-6 px-1">
        {open ? (
          <motion.div animate={{ opacity: 1 }} initial={{ opacity: 0 }} className="flex items-center gap-2">
            <div className="size-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-zinc-900" />
            <span className="font-semibold text-zinc-900 whitespace-pre">LeadGen GCC</span>
          </motion.div>
        ) : (
          <div className="size-6 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-zinc-900 mx-auto" />
        )}
      </div>

      {/* Scrollable nav */}
      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden gap-1">
        {primaryLinks.map(link => (
          <NavItem key={link.href} link={link} />
        ))}

        {/* Divider */}
        <div className="my-2 h-px w-full bg-zinc-100" />

        {groups.map(group => (
          <GroupSection
            key={group.id}
            group={group}
            expanded={expandedGroups[group.id] ?? false}
            onToggle={() => toggleGroup(group.id)}
          />
        ))}
      </div>

      {/* User menu */}
      <UserMenu user={user} />
    </motion.div>
  )
}

// ─── Mobile sidebar ───────────────────────────────────────────────────────────

function MobileSidebar({ expandedGroups, toggleGroup, user }: {
  expandedGroups: Record<string, boolean>
  toggleGroup: (id: string) => void
  user: SidebarUser
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4">
      <div className="flex items-center gap-2">
        <div className="size-5 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-zinc-900" />
        <span className="font-semibold text-zinc-900 text-sm">LeadGen GCC</span>
      </div>
      <button onClick={() => setOpen(true)}>
        <IconMenu2 className="size-5 text-zinc-600" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 flex flex-col bg-white p-6"
          >
            <button className="absolute right-4 top-4" onClick={() => setOpen(false)}>
              <IconX className="size-5 text-zinc-500" />
            </button>
            <div className="flex items-center gap-2 mb-6">
              <div className="size-6 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-zinc-900" />
              <span className="font-semibold text-zinc-900">LeadGen GCC</span>
            </div>
            <div className="flex flex-col gap-1 flex-1 overflow-y-auto">
              {primaryLinks.map(link => (
                <MobileNavItem key={link.href} link={link} onClose={() => setOpen(false)} />
              ))}
              <div className="my-2 h-px w-full bg-zinc-100" />
              {groups.map(group => (
                <GroupSection
                  key={group.id}
                  group={group}
                  expanded={expandedGroups[group.id] ?? false}
                  onToggle={() => toggleGroup(group.id)}
                  mobile
                  onClose={() => setOpen(false)}
                />
              ))}
            </div>
            <UserMenu user={user} forceOpen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Nav item ─────────────────────────────────────────────────────────────────

function NavItem({ link }: { link: NavLink }) {
  const { open } = useSidebar()
  const pathname = usePathname()
  const isActive = pathname === link.href

  return (
    <Link
      href={link.href}
      className={cn(
        'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors',
        isActive
          ? 'bg-zinc-100 text-zinc-900 font-medium'
          : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
      )}
    >
      <span className={isActive ? 'text-zinc-900' : 'text-zinc-400'}>{link.icon}</span>
      <motion.span
        animate={{ display: open ? 'block' : 'none', opacity: open ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className="whitespace-pre"
      >
        {link.label}
      </motion.span>
    </Link>
  )
}

function MobileNavItem({ link, onClose }: { link: NavLink; onClose: () => void }) {
  const pathname = usePathname()
  const isActive = pathname === link.href

  return (
    <Link
      href={link.href}
      onClick={onClose}
      className={cn(
        'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors',
        isActive ? 'bg-zinc-100 text-zinc-900 font-medium' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
      )}
    >
      {link.icon}
      {link.label}
    </Link>
  )
}

// ─── Group section ────────────────────────────────────────────────────────────

function GroupSection({ group, expanded, onToggle, mobile = false, onClose }: {
  group: NavGroup
  expanded: boolean
  onToggle: () => void
  mobile?: boolean
  onClose?: () => void
}) {
  const { open } = useSidebar()
  const showExpanded = mobile ? true : open

  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors',
          expanded ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'
        )}
      >
        <span className={expanded ? 'text-zinc-600' : 'text-zinc-400'}>{group.icon}</span>
        {showExpanded && (
          <>
            <span className="flex-1 text-left whitespace-pre">{group.label}</span>
            <IconChevronDown className={cn('size-3.5 shrink-0 transition-transform duration-200 text-zinc-400', expanded && 'rotate-180')} />
          </>
        )}
      </button>

      <AnimatePresence>
        {expanded && showExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="ml-2 mt-0.5 space-y-0.5 border-l border-zinc-100 pl-2">
              {group.links.map(link =>
                mobile
                  ? <MobileNavItem key={link.href} link={link} onClose={onClose!} />
                  : <NavItem key={link.href} link={link} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed icon-only sub-links */}
      {!showExpanded && expanded && (
        <div className="mt-0.5 flex flex-col items-center gap-0.5">
          {group.links.map(link => (
            <Link key={link.href} href={link.href} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700">
              {link.icon}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── User menu ────────────────────────────────────────────────────────────────

function UserMenu({ user, forceOpen = false }: { user: SidebarUser; forceOpen?: boolean }) {
  const { open } = useSidebar()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const showLabel = forceOpen || open

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0].toUpperCase() ?? '?'

  return (
    <div className="relative mt-2 border-t border-zinc-100 pt-2">
      <button
        onClick={() => setDropdownOpen(prev => !prev)}
        className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 hover:bg-zinc-50 transition-colors"
      >
        {/* Avatar */}
        <div className="size-7 shrink-0 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xs font-medium">
          {initials}
        </div>
        {showLabel && (
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-zinc-900 truncate">{user.name ?? 'User'}</p>
            <p className="text-xs text-zinc-400 truncate">{user.email}</p>
          </div>
        )}
      </button>

      <AnimatePresence>
        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 right-0 z-20 mb-1 rounded-lg border border-zinc-200 bg-white shadow-md py-1"
            >
              <Link
                href="/settings/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                <IconUser className="size-4 text-zinc-400" />
                Settings
              </Link>
              <Link
                href="/settings/billing"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                <IconCreditCard className="size-4 text-zinc-400" />
                Billing
              </Link>
              <div className="my-1 h-px bg-zinc-100" />
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <IconLogout className="size-4" />
                Sign out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
