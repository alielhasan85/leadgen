"use client";

import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import React, { useState, createContext, useContext, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  IconArrowNarrowLeft,
  IconBrandTabler,
  IconChevronDown,
  IconFolder,
  IconHome,
  IconMenu2,
  IconSettings,
  IconUsers,
  IconX,
  IconFileText,
  IconDatabase,
  IconChartBar,
  IconMail,
  IconBell,
  IconShield,
  IconKey,
} from "@tabler/icons-react";

const STORAGE_KEY_SIDEBAR = "aceternity-grouped-sidebar-open";
const STORAGE_KEY_GROUPS = "aceternity-grouped-sidebar-expanded";

export default function GroupedSidebar() {
  return (
    <GroupedSidebarLayout>
      <Dashboard />
    </GroupedSidebarLayout>
  );
}

interface SidebarGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  links: SidebarLinkItem[];
}

interface SidebarLinkItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function GroupedSidebarLayout({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const primaryLinks: SidebarLinkItem[] = [
    {
      label: "Dashboard",
      href: "#",
      icon: <IconBrandTabler className="size-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: "Analytics",
      href: "#",
      icon: <IconChartBar className="size-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: "Messages",
      href: "#",
      icon: <IconMail className="size-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: "Notifications",
      href: "#",
      icon: <IconBell className="size-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
  ];

  const groups: SidebarGroup[] = [
    {
      id: "content",
      label: "Content",
      icon: <IconFolder className="size-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      links: [
        {
          label: "Documents",
          href: "#",
          icon: <IconFileText className="size-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
        },
        {
          label: "Database",
          href: "#",
          icon: <IconDatabase className="size-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
        },
      ],
    },
    {
      id: "team",
      label: "Team",
      icon: <IconUsers className="size-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      links: [
        {
          label: "Members",
          href: "#",
          icon: <IconUsers className="size-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
        },
        {
          label: "Invitations",
          href: "#",
          icon: <IconMail className="size-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
        },
      ],
    },
    {
      id: "settings",
      label: "Settings",
      icon: <IconSettings className="size-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      links: [
        {
          label: "General",
          href: "#",
          icon: <IconSettings className="size-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
        },
        {
          label: "Security",
          href: "#",
          icon: <IconShield className="size-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
        },
        {
          label: "API Keys",
          href: "#",
          icon: <IconKey className="size-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
        },
      ],
    },
  ];

  const [open, setOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    content: true,
    team: true,
    settings: true,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedOpen = localStorage.getItem(STORAGE_KEY_SIDEBAR);
    const savedGroups = localStorage.getItem(STORAGE_KEY_GROUPS);

    if (savedOpen !== null) {
      setOpen(savedOpen === "true");
    }
    if (savedGroups !== null) {
      try {
        setExpandedGroups(JSON.parse(savedGroups));
      } catch {
        setExpandedGroups({ content: true, team: true, settings: true });
      }
    }
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY_SIDEBAR, String(open));
    }
  }, [open, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(expandedGroups));
    }
  }, [expandedGroups, mounted]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800",
        "h-screen",
        className
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col">
              {primaryLinks.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
            <div className="mt-4">
              <div className="h-px w-full bg-neutral-200 dark:bg-neutral-700" />
              <div className="h-px w-full bg-white dark:bg-neutral-900" />
            </div>
            <div className="mt-4 flex flex-col gap-1">
              {groups.map((group) => (
                <SidebarGroupComponent
                  key={group.id}
                  group={group}
                  expanded={expandedGroups[group.id] ?? true}
                  onToggle={() => toggleGroup(group.id)}
                />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "Manu Arora",
                href: "#",
                icon: (
                  <img
                    src="https://assets.aceternity.com/manu.png"
                    className={cn(
                      "shrink-0 rounded-full",
                      open ? "size-7" : "size-5"
                    )}
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      {children}
    </div>
  );
}

function SidebarGroupComponent({
  group,
  expanded,
  onToggle,
}: {
  group: SidebarGroup;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { open } = useSidebar();

  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          "relative flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700",
          expanded
            ? "text-neutral-900 dark:text-white"
            : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        )}
      >
        {group.icon}
        <motion.span
          animate={{
            display: open ? "inline-block" : "none",
            opacity: open ? 1 : 0,
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex-1 whitespace-pre text-left"
        >
          {group.label}
        </motion.span>
        <motion.span
          animate={{
            display: open ? "inline-block" : "none",
            opacity: open ? 1 : 0,
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <IconChevronDown
            className={cn(
              "size-4 shrink-0 transition-transform duration-200",
              expanded && "rotate-180"
            )}
          />
        </motion.span>
      </button>

      <AnimatePresence>
        {expanded && open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1 ml-2 space-y-0.5 border-l border-neutral-200 pl-2 dark:border-neutral-700">
              {group.links.map((link, idx) => (
                <SidebarLink key={idx} link={link} nested />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!open && expanded && (
        <div className="mt-1 flex flex-col items-center gap-1">
          {group.links.map((link, idx) => (
            <Link
              key={idx}
              href={link.href}
              className="rounded-md p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              {link.icon}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="#"
      className="relative z-20 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black"
    >
      <div className="size-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="whitespace-pre font-medium text-black dark:text-white"
      >
        Acet Labs
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="relative z-20 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black"
    >
      <div className="size-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </Link>
  );
};

const Dashboard = () => {
  return (
    <div className="m-2 flex flex-1">
      <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex gap-2">
          {[...new Array(4)].map((_, i) => (
            <div
              key={"first-array" + i}
              className="h-20 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-neutral-800"
            />
          ))}
        </div>
        <div className="flex flex-1 gap-2">
          {[...new Array(2)].map((_, i) => (
            <div
              key={"second-array" + i}
              className="h-full w-full animate-pulse rounded-lg bg-gray-100 dark:bg-neutral-800"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [openState, setOpenState] = useState(false);
  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...props} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen } = useSidebar();
  return (
    <motion.div
      className={cn(
        "group/sidebar-btn relative m-2 hidden h-full w-[300px] shrink-0 rounded-xl bg-white px-4 py-4 md:flex md:flex-col dark:bg-neutral-900",
        className
      )}
      animate={{ width: open ? 300 : 70 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      {...props}
    >
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "absolute -right-2 top-4 z-40 hidden size-5 transform items-center justify-center rounded-sm border border-neutral-200 bg-white transition duration-200 group-hover/sidebar-btn:flex dark:border-neutral-700 dark:bg-neutral-900",
          open ? "rotate-0" : "rotate-180"
        )}
      >
        <IconArrowNarrowLeft className="text-black dark:text-white" />
      </button>
      {children as React.ReactNode}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen } = useSidebar();
  return (
    <motion.div
      className={cn(
        "flex h-10 w-full flex-row items-center justify-between bg-neutral-100 px-4 py-4 md:hidden dark:bg-neutral-800"
      )}
      {...props}
    >
      <div className="z-20 flex w-full justify-end">
        <IconMenu2
          className="text-neutral-800 dark:text-neutral-200"
          onClick={() => setOpen(!open)}
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "fixed inset-0 z-100 flex h-full w-full flex-col justify-between bg-white p-10 dark:bg-neutral-900",
              className
            )}
          >
            <div
              className="absolute right-10 top-10 z-50 text-neutral-800 dark:text-neutral-200"
              onClick={() => setOpen(!open)}
            >
              <IconX />
            </div>
            {children as React.ReactNode}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const SidebarLink = ({
  link,
  className,
  nested = false,
  ...props
}: {
  link: SidebarLinkItem;
  className?: string;
  nested?: boolean;
  props?: LinkProps;
}) => {
  const { open } = useSidebar();
  return (
    <Link
      href={link.href}
      className={cn(
        "group/sidebar flex items-center justify-start gap-2 rounded-md px-2 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700",
        nested && "py-1.5 text-sm",
        className
      )}
      {...props}
    >
      {link.icon}
      <motion.span
        animate={{
          display: open ? "inline-block" : "none",
          opacity: open ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="m-0! inline-block p-0! whitespace-pre text-sm text-neutral-700 dark:text-neutral-200"
      >
        {link.label}
      </motion.span>
    </Link>
  );
};
