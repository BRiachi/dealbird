"use client";

import { useState } from "react";
import { Calendar, Clock, Video, User, Mail, CalendarPlus } from "lucide-react";
import { useRouter } from "next/navigation";

interface Booking {
    id: string;
    startTime: Date;
    endTime: Date;
    status: string;
    meetingUrl: string | null;
    profile: {
        product: {
            title: string;
        };
    };
    order: {
        buyerName: string | null;
        buyerEmail: string;
    } | null;
}

function buildGoogleCalendarUrl(booking: Booking) {
    const title = encodeURIComponent(
        `${booking.profile.product.title} with ${booking.order?.buyerName || booking.order?.buyerEmail || "Guest"}`
    );
    const start = new Date(booking.startTime).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const end = new Date(booking.endTime).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const details = booking.meetingUrl ? encodeURIComponent(`Join: ${booking.meetingUrl}`) : "";
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`;
}

function downloadICal(booking: Booking) {
    const start = new Date(booking.startTime).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const end = new Date(booking.endTime).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const title = `${booking.profile.product.title} with ${booking.order?.buyerName || booking.order?.buyerEmail || "Guest"}`;
    const content = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${title}`,
        booking.meetingUrl ? `URL:${booking.meetingUrl}` : "",
        `UID:${booking.id}@dealbird`,
        "END:VEVENT",
        "END:VCALENDAR",
    ].filter(Boolean).join("\r\n");

    const blob = new Blob([content], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `booking-${booking.id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
}

export function BookingsList({ bookings: initial, type }: { bookings: Booking[], type: "upcoming" | "past" }) {
    const router = useRouter();
    const [bookings, setBookings] = useState(initial);
    const [cancelling, setCancelling] = useState<string | null>(null);

    const cancel = async (id: string) => {
        if (!confirm("Cancel this booking?")) return;
        setCancelling(id);
        const res = await fetch(`/api/bookings/${id}`, { method: "PATCH" });
        if (res.ok) {
            setBookings(bookings.filter(b => b.id !== id));
            router.refresh();
        } else {
            alert("Failed to cancel booking");
        }
        setCancelling(null);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {bookings.map((booking) => {
                const start = new Date(booking.startTime);
                const end = new Date(booking.endTime);
                const duration = Math.round((end.getTime() - start.getTime()) / 60000);
                const timeStr = `${start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} - ${end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;

                return (
                    <div key={booking.id} className="group relative bg-white border border-gray-200 rounded-2xl p-5 hover:border-black/20 hover:shadow-lg transition-all">
                        {/* Status Badge */}
                        <div className="absolute top-5 right-5">
                            {type === "upcoming" ? (
                                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">Confirmed</span>
                            ) : (
                                <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">Completed</span>
                            )}
                        </div>

                        {/* Date & Time */}
                        <div className="flex items-start gap-3 mb-4">
                            <div className="bg-gray-50 rounded-xl p-2.5 text-center min-w-[60px] border border-gray-100">
                                <span className="block text-xs font-bold text-red-500 uppercase">{start.toLocaleDateString("en-US", { month: "short" })}</span>
                                <span className="block text-xl font-black text-gray-900">{start.getDate()}</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-tight mb-0.5">{booking.profile.product.title}</h3>
                                <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                                    <Clock className="w-3.5 h-3.5" />
                                    {timeStr} <span className="text-gray-300">•</span> {duration}m
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100 my-4" />

                        {/* Customer Info */}
                        <div className="space-y-2 mb-5">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <User className="w-4 h-4 text-gray-400" />
                                {booking.order?.buyerName || "Guest"}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <a href={`mailto:${booking.order?.buyerEmail}`} className="hover:text-blue-500 underline decoration-gray-300 underline-offset-2">
                                    {booking.order?.buyerEmail}
                                </a>
                            </div>
                        </div>

                        {/* Actions */}
                        {type === "upcoming" && (
                            <div className="space-y-2">
                                {booking.meetingUrl ? (
                                    <a
                                        href={booking.meetingUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
                                    >
                                        <Video className="w-4 h-4" />
                                        Join Meeting
                                    </a>
                                ) : (
                                    <div className="text-center py-2 text-sm text-gray-400 font-medium bg-gray-50 rounded-xl">
                                        No meeting link set
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <a
                                        href={buildGoogleCalendarUrl(booking)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                                    >
                                        <CalendarPlus className="w-3.5 h-3.5" />
                                        Google Cal
                                    </a>
                                    <button
                                        onClick={() => downloadICal(booking)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                                    >
                                        <Calendar className="w-3.5 h-3.5" />
                                        iCal
                                    </button>
                                </div>

                                <button
                                    onClick={() => cancel(booking.id)}
                                    disabled={cancelling === booking.id}
                                    className="w-full py-2 border border-red-200 text-red-500 rounded-xl text-xs font-semibold hover:border-red-400 hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                    {cancelling === booking.id ? "Cancelling..." : "Cancel Booking"}
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
