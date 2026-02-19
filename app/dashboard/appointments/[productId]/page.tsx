"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AppointmentProfile {
    id: string;
    duration: number;
    location: string;
    availability: Record<string, string[]>; // { mon: ["09:00-17:00"], tue: [] }
}

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export default function AvailabilityPage({ params }: { params: { productId: string } }) {
    const router = useRouter();
    const [profile, setProfile] = useState<AppointmentProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch(`/api/appointments/${params.productId}`)
            .then(async (res) => {
                const data = await res.json();
                if (data === null) {
                    // Initialize default if null
                    setProfile({
                        id: "",
                        duration: 30,
                        location: "google_meet",
                        availability: {
                            mon: ["09:00-17:00"],
                            tue: ["09:00-17:00"],
                            wed: ["09:00-17:00"],
                            thu: ["09:00-17:00"],
                            fri: ["09:00-17:00"],
                            sat: [],
                            sun: [],
                        },
                    });
                } else {
                    setProfile({
                        ...data,
                        availability: data.availability || {}
                    });
                }
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, [params.productId]);


    const saveProfile = async () => {
        if (!profile) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/appointments/${params.productId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile),
            });
            console.log("Saving profile:", profile);
            if (!res.ok) throw new Error("Failed to save");
            alert("Availability saved!");
        } catch (error) {
            alert("Error saving settings");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const updateAvailability = (day: string, value: string) => {
        if (!profile) return;
        // Simple implementation: 1 slot per day for now, or empty array if disabled
        const newSlots = value ? [value] : [];
        setProfile({
            ...profile,
            availability: { ...profile.availability, [day]: newSlots },
        });
    };

    const toggleDay = (day: string) => {
        if (!profile) return;
        const isActive = profile.availability[day]?.length > 0;
        if (isActive) {
            updateAvailability(day, ""); // Disable
        } else {
            updateAvailability(day, "09:00-17:00"); // Enable default
        }
    };

    if (loading) return <div className="p-10 text-center">Loading settings...</div>;
    if (!profile) return <div className="p-10 text-center">Error loading profile</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">←</button>
                    <div>
                        <h1 className="font-bold text-xl">Edit Availability</h1>
                        <p className="text-sm text-gray-500">Manage when people can book you</p>
                    </div>
                </div>
                <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="max-w-3xl mx-auto w-full p-8 space-y-8">

                {/* General Settings */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
                    <h2 className="font-bold text-lg">Meeting Details</h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold mb-1">Duration</label>
                            <select
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                                value={profile.duration}
                                onChange={(e) => setProfile({ ...profile, duration: parseInt(e.target.value) })}
                            >
                                <option value={15}>15 minutes</option>
                                <option value={30}>30 minutes</option>
                                <option value={45}>45 minutes</option>
                                <option value={60}>60 minutes</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Location</label>
                            <select
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                                value={profile.location}
                                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                            >
                                <option value="google_meet">Google Meet</option>
                                <option value="zoom">Zoom</option>
                                <option value="phone">Phone Call</option>
                                <option value="in_person">In Person</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Weekly Schedule */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <h2 className="font-bold text-lg mb-4">Weekly Schedule</h2>
                    <div className="space-y-4">
                        {DAYS.map((day) => {
                            const activeSlots = profile.availability[day] || [];
                            const isActive = activeSlots.length > 0;
                            const timeRange = isActive ? activeSlots[0] : "09:00-17:00";

                            return (
                                <div key={day} className="flex flex-wrap items-center gap-y-2 gap-x-4 py-3 border-b last:border-0 border-gray-100">
                                    <div className="w-12 sm:w-16 font-bold uppercase text-sm text-gray-500">{day}</div>

                                    <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={() => toggleDay(day)}
                                        className="w-5 h-5 accent-black"
                                    />

                                    {isActive ? (
                                        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto min-w-[200px]">
                                            <input
                                                type="text"
                                                className="border p-2 rounded-lg w-full sm:max-w-[200px] text-center font-mono text-sm"
                                                value={timeRange}
                                                onChange={(e) => updateAvailability(day, e.target.value)}
                                                placeholder="09:00-17:00"
                                            />
                                            <span className="text-xs text-gray-400 hidden sm:inline">(Format: HH:MM)</span>
                                        </div>
                                    ) : (
                                        <div className="flex-1 text-sm text-gray-400 italic">Unavailable</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
