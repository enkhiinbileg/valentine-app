import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader2, LogIn, Eye, Lock } from 'lucide-react'
import SharedCard from './SharedCard'
import { supabase } from '@/lib/supabase'
import { getR2UploadUrlAction, createCardAction } from '@/app/actions'
import { getProfile, signInWithGoogle } from '@/lib/auth'
import { compressImage } from '@/utils/compression'

// Sub-components
import Step1Names from './generator/Step1Names'
import Step2Content from './generator/Step2Content'
import Step2Memories from './generator/Step2Memories'
import Step3Success from './generator/Step3Success'
import PaymentModal from './generator/PaymentModal'
import { THEMES } from './generator/constants'

const CardGenerator = ({ onBack, user, profile, loadingAuth, refreshProfile }: { onBack: () => void, user: any, profile: any, loadingAuth: boolean, refreshProfile: () => Promise<void> }) => {
    const [step, setStep] = useState(1)
    const [showPreview, setShowPreview] = useState(false)
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
    const [showUpgrade, setShowUpgrade] = useState(false)
    const [formData, setFormData] = useState({
        partnerName: '',
        senderName: '',
        message: '',
        photoUrl: '',
        musicUrl: '',
        music: 'romantic',
        theme: 'starfield'
    })
    const [memories, setMemories] = useState<any[]>([])

    const [isGenerating, setIsGenerating] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)
    const [generatedLink, setGeneratedLink] = useState('')
    const [error, setError] = useState('')

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio') => {
        if (!profile?.is_paid) return; // double check

        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        setError('')

        try {
            // Compress image if selected
            const fileToUpload = type === 'image' ? await compressImage(file) : file;

            const fileName = `${Date.now()}-${file.name}`
            const { url } = await getR2UploadUrlAction(fileName, fileToUpload.type)

            const uploadRes = await fetch(url, {
                method: 'PUT',
                body: fileToUpload,
                headers: { 'Content-Type': fileToUpload.type }
            })

            if (!uploadRes.ok) throw new Error('Upload failed')

            const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileName}`

            if (type === 'image') {
                setFormData({ ...formData, photoUrl: publicUrl })
            } else {
                setFormData({ ...formData, musicUrl: publicUrl })
            }
        } catch (err) {
            console.error('Upload error:', err)
            setError('Файл хуулахад алдаа гарлаа. R2 тохиргоогоо шалгана уу.')
        } finally {
            setIsUploading(false)
        }
    }

    const handleMemoryUpload = async (file: File, type: 'image' | 'video') => {
        if (!profile?.is_paid) return;

        // Generate unique ID
        const tempId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Create local preview immediately
        const objectUrl = URL.createObjectURL(file);

        setMemories(prev => [...prev, {
            id: tempId,
            type,
            url: objectUrl, // Show local preview
            isUploading: true
        }]);

        try {
            // Facebook style compression for images
            const fileToUpload = type === 'image' ? await compressImage(file) : file;

            const fileName = `memory-${tempId}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
            const { url } = await getR2UploadUrlAction(fileName, fileToUpload.type)

            const uploadRes = await fetch(url, {
                method: 'PUT',
                body: fileToUpload,
                headers: { 'Content-Type': fileToUpload.type }
            })

            if (!uploadRes.ok) throw new Error('Upload failed')

            const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileName}`

            setMemories(prev => prev.map(m => {
                if (m.id === tempId) {
                    return { ...m, url: publicUrl, isUploading: false };
                }
                return m;
            }));

            // Cleanup blob url
            // URL.revokeObjectURL(objectUrl); // Optional: keeping it might be safer for React strict mode flickering, but good practice to release eventually. React handles src update efficiently.
        } catch (err) {
            console.error('Memory upload error:', err)
            setMemories(prev => prev.filter(m => m.id !== tempId)) // Remove failed
            setError('Файл хуулахад алдаа гарлаа.')
        }
    }

    const handleNotifyPayment = async (pkgId: string) => {
        setIsSubmittingPayment(true)
        setError('')
        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    payment_status: 'pending',
                    is_paid: false, // Reset paid status until admin confirms
                    package_type: pkgId,
                    payment_requested_at: new Date().toISOString()
                })
                .eq('id', user.id)

            if (updateError) throw updateError

            await refreshProfile();
        } catch (err) {
            console.error('Error notifying payment:', err)
            setError('Алдаа гарлаа. Дахин оролдоно уу.')
        } finally {
            setIsSubmittingPayment(false)
        }
    }

    const handleGenerate = async () => {
        if (!profile?.is_paid) return;

        setIsGenerating(true)
        setError('')

        // Package limit check for 'single'
        if (profile.package_type === 'single') {
            const { count, error: countError } = await supabase
                .from('cards')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            if (!countError && count && count >= 1) {
                setError('LIMIT_REACHED'); // Marking strictly to handle in render
                setIsGenerating(false);
                return;
            }
        }

        // Check if memories are still uploading
        if (memories.some(m => m.isUploading)) {
            setError('Файлууд хуулагдаж байна. Түр хүлээнэ үү... (Дуусахыг хүлээнэ үү)');
            setIsGenerating(false);
            return;
        }

        try {
            console.log("Start generate...");
            // setStatus('Карт үүсгэж байна...'); // Optional: local state for granular status if needed

            const id = Math.random().toString(36).substr(2, 9)

            const cardPayload = {
                id: id,
                partner_name: formData.partnerName,
                sender_name: formData.senderName,
                message: formData.message,
                photo_url: formData.photoUrl,
                music_url: formData.musicUrl,
                music_type: formData.music,
                theme: formData.theme,
                user_id: user?.id
            };

            // Create a timeout promise (45 seconds)
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Network timeout - please try again (Slow Connection)')), 45000)
            );

            // Database Operations Promise (Server Action Optimized)
            const dbOperation = async () => {
                // Prepare payload
                const memoriesPayload = memories.length > 0
                    ? memories
                        .filter(m => !m.isUploading && m.url)
                        .map(m => ({
                            card_id: id,
                            type: m.type,
                            url: m.url,
                            caption: m.caption
                        }))
                    : [];

                // Use Server Action for speed/reliability
                const response = await createCardAction(cardPayload, memoriesPayload);

                if (!response.success) {
                    throw new Error(response.error);
                }

                return id;
            };

            // Race DB vs Timeout
            await Promise.race([dbOperation(), timeoutPromise]);

            console.log("Insert success!");
            setGeneratedLink(`${window.location.origin}/c/${id}`)
            setStep(4)
        } catch (err: any) {
            console.error('Error generating card:', err)
            setError('Алдаа: ' + (err.message || 'Сүлжээний алдаа. Дахин оролдоно уу.'))
        } finally {
            setIsGenerating(false)
        }
    }

    if (loadingAuth) {
        return (
            <div className="max-w-xl mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="max-w-xl mx-auto px-4 py-20">
                <button onClick={onBack} className="flex items-center gap-2 text-rose-500 mb-8 hover:underline">
                    <ArrowLeft className="w-4 h-4" /> Буцах
                </button>
                <div className="glass-card p-12 text-center">
                    <div className="w-20 h-20 bg-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-10 h-10 text-rose-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-rose-900 mb-4">Нэвтрэх шаардлагатай</h2>
                    <p className="text-rose-700/70 mb-8">Карт үүсгэхийн тулд эхлээд Google-ээр нэвтэрнэ үү.</p>
                    <button
                        onClick={signInWithGoogle}
                        className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-200"
                    >
                        <LogIn className="w-5 h-5" /> Google-ээр нэвтрэх
                    </button>
                </div>
            </div>
        )
    }

    // Payment Flow
    if (showUpgrade || (step > 1 && !profile?.is_paid)) {
        // ... (Keep existing payment flow UI)
        if (profile?.payment_status === 'pending' && !showUpgrade) {
            return (
                <div className="max-w-xl mx-auto px-4 py-20 min-h-screen flex flex-col items-center justify-center">
                    <div className="glass-card p-12 text-center border-2 border-rose-200 bg-white/80 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 via-pink-500 to-rose-400 animate-pulse" />
                        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                            <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
                        </div>
                        <h2 className="romantic-text text-5xl text-rose-900 mb-4">Төлбөр шалгагдаж байна</h2>
                        <p className="text-rose-700/70 mb-8 leading-relaxed text-lg">
                            Таны төлбөрийг админ баталгаажуулж байна. <br />
                            Энэ нь ихэвчлэн <strong>1-5 минут</strong> зарцуулдаг. ✨
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-10 py-4 bg-rose-500 text-white rounded-2xl font-bold shadow-xl shadow-rose-200 hover:scale-105 active:scale-95 transition-all"
                        >
                            Шалгах (Reload)
                        </button>
                    </div>
                </div>
            )
        }

        return (
            <PaymentModal
                selectedPackage={selectedPackage}
                setSelectedPackage={setSelectedPackage}
                profile={profile}
                onNotifyPayment={handleNotifyPayment}
                isSubmitting={isSubmittingPayment}
                onBack={showUpgrade ? () => setShowUpgrade(false) : onBack}
            />
        )
    }

    return (
        <div className="min-h-screen pt-4 pb-20 px-4 relative z-10">
            {/* Real-time Mobile Preview Overlay */}
            <AnimatePresence>
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[100] bg-rose-50 overflow-hidden"
                    >
                        <SharedCard
                            previewData={{
                                partnerName: formData.partnerName,
                                senderName: formData.senderName,
                                message: formData.message,
                                photoUrl: formData.photoUrl || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1000&auto=format&fit=crop',
                                theme: formData.theme,
                                musicUrl: formData.musicUrl,
                                memories: memories.filter(m => !m.isUploading && m.url) // Pass memories preview
                            }}
                            onBack={() => setShowPreview(false)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={onBack}
                        className="p-3 bg-white hover:bg-rose-50 rounded-2xl text-rose-500 shadow-sm border border-rose-100 transition-all"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    {(step === 1 || step === 2 || step === 3) && (
                        <button
                            onClick={() => setShowPreview(true)}
                            className="px-6 py-3 bg-white text-rose-500 rounded-2xl font-bold text-sm border border-rose-100 shadow-sm flex items-center gap-2 hover:bg-rose-50 transition-all ripple"
                        >
                            <Eye className="w-5 h-5" /> Харах
                        </button>
                    )}
                </div>

                <div className="glass-card p-8 md:p-12">
                    {/* Error Handling */}
                    {error === 'LIMIT_REACHED' ? (
                        <div className="mb-6 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center">
                            <h3 className="text-xl font-bold text-rose-900 mb-2">Хязгаар хэтэрсэн байна! 😢</h3>
                            <p className="text-rose-700/80 mb-6">
                                Таны "Standard" багц зөвхөн 1 карт үүсгэх эрхтэй. <br />
                                Илүү олон карт үүсгэхийн тулд багцаа ахиулна уу.
                            </p>
                            <button
                                onClick={() => {
                                    setError('');
                                    setShowUpgrade(true);
                                }}
                                className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-bold shadow-lg shadow-rose-200 hover:scale-105 transition-transform"
                            >
                                🚀 Багц ахиулах (Upgrade)
                            </button>
                        </div>
                    ) : (
                        error && <div className="mb-4 p-4 bg-red-50 text-red-500 rounded-xl text-center">{error}</div>
                    )}

                    {step === 1 && (
                        <Step1Names
                            formData={formData}
                            setFormData={setFormData}
                            onNext={() => {
                                if (!profile?.is_paid) {
                                    setShowUpgrade(true);
                                } else {
                                    setStep(2);
                                }
                            }}
                            onUpgrade={() => setShowUpgrade(true)}
                            themes={THEMES}
                            userPackageType={profile?.package_type}
                        />
                    )}

                    {step === 2 && (
                        <Step2Content
                            formData={formData}
                            setFormData={setFormData}
                            onBack={() => setStep(1)}
                            onGenerate={() => setStep(3)} // Go to step 3 memories
                            isGenerating={isGenerating}
                            isUploading={isUploading}
                            handleFileUpload={handleFileUpload}
                        />
                    )}

                    {step === 3 && (
                        <Step2Memories
                            memories={memories}
                            setMemories={setMemories}
                            onBack={() => setStep(2)}
                            onGenerate={handleGenerate}
                            isGenerating={isGenerating}
                            handleFileUpload={handleMemoryUpload}
                        />
                    )}

                    {step === 4 && (
                        <Step3Success generatedLink={generatedLink} />
                    )}
                </div>
            </div>
        </div>
    )
}

export default CardGenerator
