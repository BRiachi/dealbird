"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Lesson {
    id: string;
    title: string;
    order: number;
    videoType: "UPLOADTHING" | "YOUTUBE";
    videoUrl?: string;
    body?: string;
    isFreePreview: boolean;
    completed?: boolean;
}

interface Module {
    id: string;
    title: string;
    order: number;
    lessons: Lesson[];
}

interface Course {
    id: string;
    product: {
        id: string;
        title: string;
        user: { handle: string; name: string };
    };
    modules: Module[];
}

export default function CourseViewerPage({ params }: { params: { productId: string } }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [accessError, setAccessError] = useState<"login" | "purchase" | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        fetch(`/api/courses/${params.productId}/learn`)
            .then(async res => {
                if (res.status === 401) { setAccessError("login"); setLoading(false); return null; }
                if (res.status === 403) { setAccessError("purchase"); setLoading(false); return null; }
                if (!res.ok) throw new Error("Course not found");
                return res.json();
            })
            .then(data => {
                if (!data) return;
                setCourse(data);
                if (data.modules?.length > 0 && data.modules[0].lessons.length > 0) {
                    setActiveLesson(data.modules[0].lessons[0]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [params.productId]);

    const markComplete = async (lessonId: string) => {
        // Optimistic update
        if (!course) return;

        const updatedModules = course.modules.map(m => ({
            ...m,
            lessons: m.lessons.map(l => l.id === lessonId ? { ...l, completed: true } : l)
        }));
        setCourse({ ...course, modules: updatedModules });

        await fetch(`/api/courses/progress`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lessonId, completed: true }),
        });

        // Auto-advance logic could go here
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Course...</div>;

    if (accessError === "login") {
        router.replace(`/login?callbackUrl=/learn/${params.productId}`);
        return null;
    }

    if (accessError === "purchase") return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
            <div className="text-5xl">🔒</div>
            <h1 className="text-2xl font-bold">Purchase Required</h1>
            <p className="text-gray-500">You need to buy this course to access the content.</p>
            <button onClick={() => router.back()} className="mt-2 px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800">
                Go Back
            </button>
        </div>
    );

    if (!course) return <div className="min-h-screen flex items-center justify-center">Course not found.</div>;

    return (
        <div className="flex h-screen bg-white">
            {/* Sidebar */}
            <div
                className={`fixed lg:relative z-20 h-full bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${isSidebarOpen ? "w-[300px] translate-x-0" : "w-0 -translate-x-full lg:w-0 lg:translate-x-0 overflow-hidden border-none"}`}
            >
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <Link href="/dashboard" className="text-xs font-bold text-gray-400 hover:text-black uppercase tracking-wider mb-1 block">← Back into App</Link>
                    <h2 className="font-bold text-lg leading-tight">{course.product.title}</h2>
                    <p className="text-xs text-gray-500">by {course.product.user.name || course.product.user.handle}</p>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {course.modules.map(module => (
                        <div key={module.id} className="border-b border-gray-50">
                            <div className="px-4 py-3 bg-gray-50/30 font-bold text-sm text-gray-700">
                                {module.title}
                            </div>
                            <div>
                                {module.lessons.map(lesson => (
                                    <button
                                        key={lesson.id}
                                        onClick={() => { setActiveLesson(lesson); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                                        className={`w-full text-left px-4 py-3 text-sm flex items-start gap-3 hover:bg-gray-50 transition-colors ${activeLesson?.id === lesson.id ? "bg-black text-white hover:bg-black" : "text-gray-600"}`}
                                    >
                                        <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${lesson.completed ? "bg-green-500 border-green-500 text-white" : "border-gray-300"}`}>
                                            {lesson.completed && "✓"}
                                        </div>
                                        <span className={activeLesson?.id === lesson.id ? "font-bold" : ""}>
                                            {lesson.title}
                                        </span>
                                        {lesson.videoUrl && <span className="ml-auto text-xs opacity-60">📺</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Mobile Toggle */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute top-4 left-4 z-10 bg-black text-white p-2 rounded-full shadow-lg lg:hidden"
                >
                    {isSidebarOpen ? "✕" : "☰"}
                </button>

                <div className="flex-1 overflow-y-auto">
                    {activeLesson ? (
                        <div className="max-w-4xl mx-auto w-full">
                            {/* Video Player */}
                            {activeLesson.videoUrl && (
                                <div className="bg-black w-full aspect-video">
                                    <video
                                        src={activeLesson.videoUrl}
                                        controls
                                        className="w-full h-full"
                                        autoPlay={false}
                                    />
                                </div>
                            )}

                            <div className="p-8 lg:p-12">
                                <div className="flex justify-between items-start mb-6">
                                    <h1 className="text-3xl font-bold">{activeLesson.title}</h1>
                                    {!activeLesson.completed && (
                                        <button
                                            onClick={() => markComplete(activeLesson.id)}
                                            className="bg-black text-white px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform shadow-lg"
                                        >
                                            Mark Complete
                                        </button>
                                    )}
                                </div>

                                <div className="prose prose-lg max-w-none text-gray-600">
                                    {activeLesson.body ? (
                                        <div dangerouslySetInnerHTML={{ __html: activeLesson.body }} />
                                    ) : (
                                        <p className="italic text-gray-400">No text content for this lesson.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Select a lesson to start learning
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
