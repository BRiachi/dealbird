"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { UploadButton } from "@/app/utils/uploadthing";

interface Lesson {
    id: string;
    title: string;
    order: number;
    videoType: "UPLOADTHING" | "YOUTUBE";
    videoUrl?: string;
    body?: string;
    isFreePreview: boolean;
}

interface Module {
    id: string;
    title: string;
    order: number;
    lessons: Lesson[];
}

interface Course {
    id: string;
    productId: string;
    modules: Module[];
}

export default function CourseBuilderPage({ params }: { params: { productId: string } }) {
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Inline add state
    const [addingModule, setAddingModule] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState("");
    const [addingLessonToModule, setAddingLessonToModule] = useState<string | null>(null);
    const [newLessonTitle, setNewLessonTitle] = useState("");
    const moduleInputRef = useRef<HTMLInputElement>(null);
    const lessonInputRef = useRef<HTMLInputElement>(null);

    // Mobile view toggle
    const [mobileView, setMobileView] = useState<"modules" | "editor">("modules");

    useEffect(() => {
        fetch(`/api/courses/${params.productId}`)
            .then(async (res) => {
                const text = await res.text();
                try {
                    const data = JSON.parse(text);
                    if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
                    setCourse(data);
                    setLoading(false);
                } catch (e) {
                    throw new Error(`API Error (${res.status}): ${text.substring(0, 100)}`);
                }
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, [params.productId]);

    useEffect(() => {
        if (addingModule && moduleInputRef.current) moduleInputRef.current.focus();
    }, [addingModule]);

    useEffect(() => {
        if (addingLessonToModule && lessonInputRef.current) lessonInputRef.current.focus();
    }, [addingLessonToModule]);

    if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;
    if (loading) return <div className="p-10 text-center">Loading Curriculum...</div>;

    const addModule = async () => {
        const title = newModuleTitle.trim();
        if (!title || !course) return;
        setNewModuleTitle("");
        setAddingModule(false);

        const res = await fetch("/api/courses/modules", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ courseId: course.id, title }),
        });
        if (res.ok) {
            const newModule = await res.json();
            setCourse({ ...course, modules: [...course.modules, { ...newModule, lessons: [] }] });
        }
    };

    const addLesson = async (moduleId: string) => {
        const title = newLessonTitle.trim();
        if (!title || !course) return;
        setNewLessonTitle("");
        setAddingLessonToModule(null);

        const res = await fetch("/api/courses/lessons", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ moduleId, title }),
        });
        if (res.ok) {
            const newLesson = await res.json();
            setCourse({
                ...course,
                modules: course.modules.map(m =>
                    m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m
                ),
            });
        }
    };

    const updateLesson = async (id: string, updates: Partial<Lesson>) => {
        if (!course) return;
        setCourse({
            ...course,
            modules: course.modules.map(m => ({
                ...m,
                lessons: m.lessons.map(l => l.id === id ? { ...l, ...updates } : l),
            })),
        });
        if (activeLesson?.id === id) setActiveLesson(prev => prev ? { ...prev, ...updates } : null);

        await fetch("/api/courses/lessons", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, ...updates }),
        });
    };

    const deleteModule = async (id: string) => {
        if (!confirm("Delete this module and all its lessons?")) return;
        const res = await fetch(`/api/courses/modules?id=${id}`, { method: "DELETE" });
        if (res.ok && course) {
            setCourse({ ...course, modules: course.modules.filter(m => m.id !== id) });
            if (activeLesson) setActiveLesson(null);
        }
    };

    const deleteLesson = async (id: string, moduleId: string) => {
        if (!confirm("Delete this lesson?")) return;
        const res = await fetch(`/api/courses/lessons?id=${id}`, { method: "DELETE" });
        if (res.ok && course) {
            setCourse({
                ...course,
                modules: course.modules.map(m =>
                    m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== id) } : m
                ),
            });
            if (activeLesson?.id === id) setActiveLesson(null);
        }
    };

    return (
        <div className="flex h-[calc(100vh-96px)] lg:h-[calc(100vh-192px)] bg-gray-50">
            {/* Modules panel — full width on mobile, 1/3 on desktop */}
            <div className={`w-full md:w-1/3 border-r border-gray-200 bg-white flex flex-col shrink-0 ${mobileView === "editor" ? "hidden md:flex" : "flex"}`}>
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 shrink-0">
                    <div>
                        <Link href="/dashboard/links" className="text-xs text-gray-500 hover:text-black">← Back to Store</Link>
                        <h1 className="font-bold text-lg mt-1">Curriculum</h1>
                    </div>
                    <button
                        onClick={() => { setAddingModule(true); setAddingLessonToModule(null); }}
                        className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-800"
                    >
                        + Module
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {course?.modules.map((module) => (
                        <div key={module.id} className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50">
                            <div className="p-3 bg-gray-100 border-b border-gray-200 flex justify-between items-center group">
                                <h3 className="font-bold text-sm text-gray-700">{module.title}</h3>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => { setAddingLessonToModule(module.id); setAddingModule(false); setNewLessonTitle(""); }}
                                        className="text-xs bg-white border px-2 py-1 rounded shadow-sm hover:bg-gray-50"
                                    >
                                        + Lesson
                                    </button>
                                    <button onClick={() => deleteModule(module.id)} className="text-xs text-red-500 hover:text-red-700">🗑</button>
                                </div>
                            </div>
                            <div className="p-2 space-y-1">
                                {module.lessons.map(lesson => (
                                    <div
                                        key={lesson.id}
                                        onClick={() => { setActiveLesson(lesson); setMobileView("editor"); }}
                                        className={`p-2 rounded-lg text-sm cursor-pointer flex justify-between items-center group ${activeLesson?.id === lesson.id ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-100"}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs">{lesson.videoUrl ? "🎥" : "📄"}</span>
                                            <span>{lesson.title}</span>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteLesson(lesson.id, module.id); }}
                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                                        >✕</button>
                                    </div>
                                ))}

                                {/* Inline add lesson */}
                                {addingLessonToModule === module.id && (
                                    <div className="flex gap-1 mt-1">
                                        <input
                                            ref={lessonInputRef}
                                            value={newLessonTitle}
                                            onChange={e => setNewLessonTitle(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === "Enter") addLesson(module.id);
                                                if (e.key === "Escape") { setAddingLessonToModule(null); setNewLessonTitle(""); }
                                            }}
                                            placeholder="Lesson title..."
                                            className="flex-1 text-xs border border-gray-300 rounded px-2 py-1.5 outline-none focus:border-black"
                                        />
                                        <button onClick={() => addLesson(module.id)} className="text-xs bg-black text-white px-2 py-1 rounded">Add</button>
                                        <button onClick={() => { setAddingLessonToModule(null); setNewLessonTitle(""); }} className="text-xs text-gray-400 px-1">✕</button>
                                    </div>
                                )}

                                {module.lessons.length === 0 && addingLessonToModule !== module.id && (
                                    <div className="text-center text-xs text-gray-400 py-2">No lessons yet</div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Inline add module */}
                    {addingModule && (
                        <div className="border border-dashed border-gray-300 rounded-xl p-3 bg-white">
                            <div className="flex gap-2">
                                <input
                                    ref={moduleInputRef}
                                    value={newModuleTitle}
                                    onChange={e => setNewModuleTitle(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") addModule();
                                        if (e.key === "Escape") { setAddingModule(false); setNewModuleTitle(""); }
                                    }}
                                    placeholder="Module title..."
                                    className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-black"
                                />
                                <button onClick={addModule} className="text-sm bg-black text-white px-3 py-2 rounded-lg font-bold">Add</button>
                                <button onClick={() => { setAddingModule(false); setNewModuleTitle(""); }} className="text-sm text-gray-400 px-2">✕</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Lesson editor — full width on mobile, flex-1 on desktop */}
            <div className={`flex-1 flex flex-col overflow-hidden ${mobileView === "modules" ? "hidden md:flex" : "flex"}`}>
                {/* Mobile back button */}
                <div className="md:hidden shrink-0 p-3 border-b bg-white">
                    <button onClick={() => setMobileView("modules")} className="text-sm text-gray-500 hover:text-black">← Back to Modules</button>
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-50">
                    {activeLesson ? (
                        <div className="max-w-2xl mx-auto py-10 px-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Lesson Title</label>
                                    <input
                                        className="text-2xl font-bold w-full outline-none placeholder-gray-300"
                                        value={activeLesson.title}
                                        onChange={(e) => updateLesson(activeLesson.id, { title: e.target.value })}
                                    />
                                </div>

                                <div className="p-6 space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Video Content</label>
                                        {activeLesson.videoUrl ? (
                                            <div className="rounded-xl overflow-hidden bg-black aspect-video relative group">
                                                <video src={activeLesson.videoUrl} controls className="w-full h-full" />
                                                <button
                                                    onClick={() => updateLesson(activeLesson.id, { videoUrl: "" })}
                                                    className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    Remove Video
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
                                                <UploadButton
                                                    endpoint="productFile"
                                                    onClientUploadComplete={(res) => {
                                                        if (res?.[0]) updateLesson(activeLesson.id, { videoUrl: res[0].url });
                                                    }}
                                                    onUploadError={(error: Error) => alert(`Error: ${error.message}`)}
                                                    appearance={{ button: "bg-black text-white px-4 py-2 text-sm font-bold" }}
                                                />
                                                <p className="text-xs text-gray-400 mt-2">MP4 up to 32MB</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Lesson Body */}
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Lesson Notes / Text</label>
                                        <textarea
                                            value={activeLesson.body || ""}
                                            onChange={(e) => updateLesson(activeLesson.id, { body: e.target.value })}
                                            placeholder="Add text content, notes, or instructions for this lesson..."
                                            rows={6}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black resize-y"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                                        <input
                                            type="checkbox"
                                            checked={activeLesson.isFreePreview}
                                            onChange={(e) => updateLesson(activeLesson.id, { isFreePreview: e.target.checked })}
                                            className="w-5 h-5 accent-yellow-600"
                                        />
                                        <div>
                                            <div className="font-bold text-sm text-yellow-900">Free Preview</div>
                                            <div className="text-xs text-yellow-700">Allow potential buyers to watch this lesson for free</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-[300px] text-gray-400">
                            <div className="text-center">
                                <div className="text-4xl mb-2">👈</div>
                                <p>Select a lesson to edit</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
