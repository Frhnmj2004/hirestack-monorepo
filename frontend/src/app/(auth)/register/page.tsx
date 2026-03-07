'use client'

import { useState } from 'react'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        agreeToTerms: false,
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Signup submitted:', formData)
        router.push('/dashboard')
    }

    return (
        <div className="w-full h-full min-h-screen bg-[#0B0726] flex items-center justify-center p-4 sm:p-8">
            <div className="flex flex-col md:flex-row w-full max-w-5xl h-full min-h-[600px] bg-white rounded-[2rem] shadow-2xl overflow-hidden">
                {/* Left Panel */}
                <div className="flex-1 relative overflow-hidden hidden md:block p-2 pl-2 rounded-l-[2rem]">
                    <div className="absolute top-8 left-8 z-10">
                        <button
                            onClick={() => router.push('/')}
                            className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/30 transition-all cursor-pointer border border-white/10"
                        >
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative">
                        <img
                            src="https://i.ibb.co/dJxBbFks/brandasset.png"
                            alt="Brand Asset"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Right Panel */}
                <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-white">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 font-sans tracking-tight">Create an Account</h1>
                        <p className="text-gray-600 text-sm">
                            Already have an account?{' '}
                            <Link href="/login" className="text-brand-violet hover:text-brand-lavender font-medium transition-colors">
                                Log in
                            </Link>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder="John"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet outline-none transition-all text-gray-900 bg-gray-50/50"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    placeholder="Doe"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet outline-none transition-all text-gray-900 bg-gray-50/50"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="you@company.com"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet outline-none transition-all text-gray-900 bg-gray-50/50"
                                required
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet outline-none transition-all text-gray-900 bg-gray-50/50"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4 text-gray-400" />
                                    ) : (
                                        <Eye className="w-4 h-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-center space-x-3 pt-2">
                            <input
                                type="checkbox"
                                id="agreeToTerms"
                                name="agreeToTerms"
                                checked={formData.agreeToTerms}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-brand-violet border-gray-300 rounded focus:ring-brand-violet cursor-pointer"
                                required
                            />
                            <label htmlFor="agreeToTerms" className="text-sm text-gray-600 select-none cursor-pointer">
                                I agree to the{' '}
                                <button type="button" className="text-gray-900 font-semibold hover:text-brand-violet transition-colors">
                                    Terms & Conditions
                                </button>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-[#0B0726] text-white py-3.5 px-4 rounded-xl font-medium hover:bg-[#1A1147] transition-all shadow-lg hover:shadow-xl mt-4"
                        >
                            Create Account
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
