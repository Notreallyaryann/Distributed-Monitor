"use client";

import { signIn } from "next-auth/react"
import Image from "next/image"
import { Github, Globe } from "lucide-react"

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#07090D] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
            </div>

            <div className="relative z-10 w-full max-w-md p-8">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                            <Globe className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Monitor Hub</h1>
                        <p className="text-slate-400 text-sm">Sign in to manage your distributed infrastructure</p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => signIn("google", { callbackUrl: "/" })}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-slate-100 transition-all duration-200 shadow-sm active:scale-[0.98]"
                        >
                            <Image 
                                src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
                                alt="Google" 
                                width={20}
                                height={20}
                                className="w-5 h-5"
                            />
                            <span>Continue with Google</span>
                        </button>

                        <button
                            onClick={() => signIn("github", { callbackUrl: "/" })}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#24292F] text-white font-semibold rounded-lg hover:bg-[#1b1f23] transition-all duration-200 shadow-sm active:scale-[0.98]"
                        >
                            <Github className="w-5 h-5" />
                            <span>Continue with GitHub</span>
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-xs text-slate-500">
                             By continuing, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </div>
                
                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-sm">
                        &copy; 2026 Distributed Monitor. All rights reserved.
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.1); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 10s infinite;
                }
            `}</style>
        </div>
    );
}
