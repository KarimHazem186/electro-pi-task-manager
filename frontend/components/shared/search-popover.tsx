"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useTranslations } from "next-intl";
import {
  CornerDownLeft,
  Folder,
  ListTodo,
  Loader2,
  Search as SearchIcon,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useGlobalSearch } from "@/hooks/use-global-search";
import { useRouter } from "@/i18n/routing";
import type {
  SearchProjectHit,
  SearchTaskHit,
} from "@/types";

type FlatItem =
  | { kind: "project"; data: SearchProjectHit }
  | { kind: "task"; data: SearchTaskHit };

const DEBOUNCE_MS = 250;
const MIN_QUERY = 2;

function highlight(text: string, query: string) {
  if (!query) return text;
  const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${safe})`, "ig"));
  return parts.map((part, idx) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={idx}
        className="rounded bg-primary/15 px-0.5 text-foreground"
      >
        {part}
      </mark>
    ) : (
      <span key={idx}>{part}</span>
    ),
  );
}

function statusLabelKey(
  status: "todo" | "in_progress" | "done" | "active" | "archived",
) {
  return status as
    | "todo"
    | "in_progress"
    | "done"
    | "active"
    | "archived";
}

export function SearchPopover() {
  const t = useTranslations("topbar");
  const tTasks = useTranslations("tasks.status");
  const tProjects = useTranslations("projects.status");
  const tPriority = useTranslations("tasks.priority");
  const router = useRouter();

  const inputId = useId();
  const listboxId = useId();

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Debounce
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [query]);

  const { data, isFetching, isError } = useGlobalSearch({ q: debounced });

  const projects = data?.projects ?? [];
  const tasks = data?.tasks ?? [];

  // Flat list for keyboard navigation
  const flatItems: FlatItem[] = useMemo(
    () => [
      ...projects.map((p) => ({ kind: "project" as const, data: p })),
      ...tasks.map((task) => ({ kind: "task" as const, data: task })),
    ],
    [projects, tasks],
  );

  // Reset active index when result set changes
  useEffect(() => {
    setActiveIndex(0);
  }, [debounced, flatItems.length]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Cmd/Ctrl+K shortcut
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isShortcut) {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (event.key === "Escape" && open) {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const goTo = useCallback(
    (item: FlatItem) => {
      setOpen(false);
      if (item.kind === "project") {
        router.push(`/projects/${item.data.slug}`);
      } else {
        const slug = item.data.project?.slug;
        if (!slug) return;
        router.push(`/projects/${slug}?taskId=${item.data.id}`);
      }
    },
    [router],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open) setOpen(true);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (flatItems.length === 0) return;
      setActiveIndex((i) => (i + 1) % flatItems.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (flatItems.length === 0) return;
      setActiveIndex((i) => (i - 1 + flatItems.length) % flatItems.length);
    } else if (event.key === "Enter") {
      const target = flatItems[activeIndex];
      if (target) {
        event.preventDefault();
        goTo(target);
      } else if (query.trim().length >= MIN_QUERY) {
        // No specific hit, take the user to the full results page if there is one.
        // We don't have a dedicated results page yet, so just go to projects with ?q=
        event.preventDefault();
        router.push(`/projects?q=${encodeURIComponent(query.trim())}`);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const showResults = open && debounced.length >= MIN_QUERY;
  const showHint = open && debounced.length < MIN_QUERY;
  const total = projects.length + tasks.length;

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1 sm:max-w-md">
      <div className="relative">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id={inputId}
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showResults}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            showResults && flatItems[activeIndex]
              ? `${listboxId}-${activeIndex}`
              : undefined
          }
          autoComplete="off"
          spellCheck={false}
          placeholder={t("search")}
          aria-label={t("search")}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="h-9 rounded-xl ps-9 pe-16"
        />
        <div className="pointer-events-none absolute end-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 sm:flex">
          {query ? (
            <button
              type="button"
              aria-label={t("clear")}
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="pointer-events-auto inline-flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          ) : (
            <kbd className="rounded border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {open && (showResults || showHint) && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+6px)] z-50 max-h-[min(70vh,520px)] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl outline-none"
        >
          {showHint && (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground">
              {t("searchHint")}
            </div>
          )}

          {showResults && (
            <>
              <div className="flex items-center justify-between gap-2 px-4 py-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                <span>
                  {isFetching ? t("searching") : t("resultsCount", { count: total })}
                </span>
                {isFetching && <Loader2 className="size-3 animate-spin" />}
              </div>
              <Separator />

              <div className="max-h-[min(60vh,420px)] overflow-y-auto p-1.5">
                {isError && (
                  <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                    {t("searchError")}
                  </div>
                )}

                {!isError && total === 0 && !isFetching && (
                  <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                    {t("emptyResults", { query: debounced })}
                  </div>
                )}

                {projects.length > 0 && (
                  <SectionHeader
                    label={t("sectionProjects")}
                    icon={<Folder className="size-3.5" />}
                  />
                )}
                <ul className="mb-1 space-y-0.5">
                  {projects.map((project, idx) => {
                    const index = idx;
                    const isActive = activeIndex === index;
                    return (
                      <li key={`p-${project.id}`} role="presentation">
                        <button
                          id={`${listboxId}-${index}`}
                          role="option"
                          aria-selected={isActive}
                          type="button"
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => goTo({ kind: "project", data: project })}
                          className={cn(
                            "flex w-full items-start gap-3 rounded-lg px-3 py-2 text-start transition-colors",
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent/60",
                          )}
                        >
                          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                            <Folder className="size-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="truncate text-sm font-medium">
                                {highlight(project.name, debounced)}
                              </span>
                              <Badge
                                variant="outline"
                                className="shrink-0 text-[10px]"
                              >
                                {tProjects(statusLabelKey(project.status))}
                              </Badge>
                            </span>
                            {project.description && (
                              <span className="line-clamp-1 text-xs text-muted-foreground">
                                {highlight(project.description, debounced)}
                              </span>
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {tasks.length > 0 && (
                  <SectionHeader
                    label={t("sectionTasks")}
                    icon={<ListTodo className="size-3.5" />}
                  />
                )}
                <ul className="space-y-0.5">
                  {tasks.map((task, idx) => {
                    const index = projects.length + idx;
                    const isActive = activeIndex === index;
                    return (
                      <li key={`t-${task.id}`} role="presentation">
                        <button
                          id={`${listboxId}-${index}`}
                          role="option"
                          aria-selected={isActive}
                          type="button"
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => goTo({ kind: "task", data: task })}
                          className={cn(
                            "flex w-full items-start gap-3 rounded-lg px-3 py-2 text-start transition-colors",
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent/60",
                          )}
                        >
                          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400">
                            <ListTodo className="size-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="truncate text-sm font-medium">
                                {highlight(task.title, debounced)}
                              </span>
                              <Badge
                                variant="outline"
                                className="shrink-0 text-[10px]"
                              >
                                {tTasks(statusLabelKey(task.status))}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className="shrink-0 text-[10px]"
                              >
                                {tPriority(task.priority)}
                              </Badge>
                            </span>
                            <span className="line-clamp-1 text-xs text-muted-foreground">
                              {task.project?.name ? `${task.project.name} · ` : ""}
                              {highlight(task.description || "", debounced)}
                            </span>
                          </span>
                          {isActive && (
                            <CornerDownLeft
                              className="mt-1 size-3.5 shrink-0 text-muted-foreground"
                              aria-hidden
                            />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <Separator />
              <div className="flex items-center justify-between gap-2 px-3 py-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Kbd>↑</Kbd>
                    <Kbd>↓</Kbd>
                    {t("navigate")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Kbd>↵</Kbd>
                    {t("open")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Kbd>esc</Kbd>
                    {t("close")}
                  </span>
                </div>
                {total > 0 && (
                  <span className="hidden sm:inline">
                    {t("pressEnterForAll")}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {icon}
      {label}
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded border border-border bg-muted/60 px-1 text-[10px] font-medium text-muted-foreground">
      {children}
    </kbd>
  );
}
