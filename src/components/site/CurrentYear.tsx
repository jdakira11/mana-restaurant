"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Año actual calculado en el navegador (evita usar la fecha durante el prerenderizado estático). */
export function CurrentYear() {
  const year = useSyncExternalStore(
    subscribe,
    () => String(new Date().getFullYear()),
    () => "",
  );
  return <span suppressHydrationWarning>{year}</span>;
}
