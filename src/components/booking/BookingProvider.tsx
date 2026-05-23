"use client";

import { createContext, useCallback, useContext, useState } from "react";

export type PrefilledSlot = {
  startISO: string;
  endISO: string;
  label: string;
};

type BookingContextValue = {
  isOpen: boolean;
  openBooking: (prefill?: {
    slot?: PrefilledSlot;
    dateYMD?: string;
  }) => void;
  closeBooking: () => void;
  prefilledSlot: PrefilledSlot | null;
  prefilledDateYMD: string | null;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prefilledSlot, setPrefilledSlot] = useState<PrefilledSlot | null>(
    null,
  );
  const [prefilledDateYMD, setPrefilledDateYMD] = useState<string | null>(null);

  const openBooking = useCallback<BookingContextValue["openBooking"]>(
    (prefill) => {
      setPrefilledSlot(prefill?.slot ?? null);
      setPrefilledDateYMD(prefill?.dateYMD ?? null);
      setIsOpen(true);
    },
    [],
  );

  const closeBooking = useCallback(() => {
    setIsOpen(false);
    setPrefilledSlot(null);
    setPrefilledDateYMD(null);
  }, []);

  return (
    <BookingContext.Provider
      value={{
        isOpen,
        openBooking,
        closeBooking,
        prefilledSlot,
        prefilledDateYMD,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside BookingProvider");
  return ctx;
}
