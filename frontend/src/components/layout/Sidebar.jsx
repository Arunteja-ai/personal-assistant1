import { NavLink } from "react-router-dom";
import clsx from "clsx";

const navClassName = ({ isActive }) =>
  clsx(
    "group flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition",
    isActive
      ? "bg-app-accent text-white"
      : "text-app-muted hover:bg-app-accentSoft hover:text-app-ink",
  );

export const Sidebar = ({ label, title, description, items }) => (
  <aside className="panel flex h-full flex-col gap-8 p-6">
    <div>
      <span className="rounded-full bg-app-accentSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-app-accent">
        {label}
      </span>
      <h1 className="mt-4 font-display text-2xl text-app-ink">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-app-muted">{description}</p>
    </div>

    <nav className="flex-1 space-y-2">
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} className={navClassName}>
          <span>{item.label}</span>
          <span className="text-xs opacity-70">{item.shortcut}</span>
        </NavLink>
      ))}
    </nav>
  </aside>
);
