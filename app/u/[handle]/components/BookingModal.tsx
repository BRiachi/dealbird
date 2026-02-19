"use client";

import { useState, useEffect } from "react";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMinutes, parse } from "date-fns";

interface Props {
    productId: string;
    duration: number; // minutes
    isOpen: boolean;
    onClose: () => void;
    onSelect: (start: Date, end: Date) => void;
}

export default function BookingModal({ productId, duration, isOpen, onClose, onSelect }: Props) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [slots, setSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    if (!isOpen) return null;

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });
    const startOffset = startOfMonth(currentMonth).getDay(); // 0=Sun … 6=Sat

    const handleDateClick = async (date: Date) => {
        setSelectedDate(date);
        setLoadingSlots(true);
        setSlots([]);

        try {
            const dateStr = format(date, "yyyy-MM-dd");
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const res = await fetch(`/api/appointments/${productId}/slots?date=${dateStr}&timezone=${timezone}`);
            const data = await res.json();
            if (data.slots) {
                setSlots(data.slots);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleSlotClick = (timeStr: string) => {
        if (!selectedDate) return;
        // Parse timeStr "HH:mm" onto selectedDate
        const start = parse(timeStr, "HH:mm", selectedDate);
        const end = addMinutes(start, duration);
        onSelect(start, end);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Content */}
            <div className="bg-white w-full md:w-auto md:max-w-4xl rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col md:flex-row max-h-[85vh] md:max-h-[600px] overflow-hidden">

                {/* Mobile Drag Handle / Header */}
                <div className="md:hidden flex flex-col items-center pt-3 pb-2 border-b border-gray-100 bg-white sticky top-0 z-10 w-full" onClick={onClose}>
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-2"></div>
                </div>

                {/* Calendar Section */}
                <div className="p-6 flex-1 md:border-r border-gray-100 overflow-y-auto md:overflow-visible">
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, -1))} className="p-2 hover:bg-gray-100 rounded-full">←</button>
                        <h3 className="font-bold text-lg">{format(currentMonth, "MMMM yyyy")}</h3>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-full">→</button>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                            <div key={d} className="font-bold text-gray-400 text-xs uppercase">{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: startOffset }).map((_, i) => (
                            <div key={`offset-${i}`} />
                        ))}
                        {daysInMonth.map((day, i) => {
                            const isSelected = selectedDate && isSameDay(day, selectedDate);
                            const isCurrentMonth = isSameMonth(day, currentMonth);
                            const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

                            // Align the first day of the month
                            // This is a simplified grid, actually we need to pad the start if we want perfect alignment
                            // But usually `eachDayOfInterval` covers full range if start/end are month boundaries.
                            // However, we need to add empty divs for the offset if `daysInMonth` starts on a non-Sunday.
                            // Wait, the previous code didn't handle offset. 
                            // Let's improve the calendar grid logic slightly while we are here:
                            // We should really start from the start of the week.

                            return (
                                <button
                                    key={day.toISOString()}
                                    disabled={!isCurrentMonth || isPast}
                                    onClick={() => handleDateClick(day)}
                                    className={`
                                        h-10 w-10 md:h-11 md:w-11 rounded-full flex items-center justify-center text-sm font-bold transition-all mx-auto
                                        ${!isCurrentMonth ? "invisible" : ""}
                                        ${isSelected ? "bg-black text-white scale-110" : "hover:bg-gray-100 active:bg-gray-200"}
                                        ${isToday(day) && !isSelected ? "text-blue-600 border border-blue-200" : ""}
                                        ${isPast ? "opacity-20 cursor-not-allowed hover:bg-transparent" : ""}
                                    `}
                                >
                                    {format(day, "d")}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Slots Section */}
                {selectedDate && (
                    <div className="p-6 w-full md:w-[320px] bg-gray-50 overflow-y-auto border-t md:border-t-0 md:min-h-[500px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">
                                {format(selectedDate, "EEEE, MMM d")}
                            </h3>
                            <button onClick={() => setSelectedDate(null)} className="md:hidden text-sm text-gray-500">Close</button>
                        </div>

                        {loadingSlots ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-gray-200 rounded-xl animate-pulse" />)}
                            </div>
                        ) : (
                            <div className="space-y-3 pb-8 md:pb-0">
                                {slots.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No available slots.</p>
                                    </div>
                                )}
                                {slots.map((slot) => (
                                    <button
                                        key={slot}
                                        onClick={() => handleSlotClick(slot)}
                                        className="w-full py-3 border border-gray-200 bg-white hover:border-black hover:bg-black hover:text-white rounded-xl font-bold transition-all text-sm shadow-sm"
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Desktop backdrop click to close (handled by outer div click if we add logic, but simple Prop onClose on a button is safer) */}
            <button
                onClick={onClose}
                className="hidden md:block absolute top-6 right-6 text-white/80 hover:text-white bg-black/50 p-2 rounded-full backdrop-blur-md transition-colors"
            >
                ✕
            </button>
        </div>
    );
}
