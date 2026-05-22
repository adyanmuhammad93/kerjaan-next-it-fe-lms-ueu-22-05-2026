import React, { useState, useEffect } from 'react';
import { Shield, Save, Loader2, CheckCircle2, AlertCircle, Settings2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { settingsService } from '../../../services/settingsService';

export const AdminSettings: React.FC = () => {
    const [moderationEnabled, setModerationEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const config = await settingsService.getSetting('course_moderation');
                if (config) {
                    setModerationEnabled(!!config.enabled);
                }
            } catch (error) {
                console.error("Gagal memuat pengaturan akademik:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await settingsService.updateSetting('course_moderation', { enabled: moderationEnabled });
            setLastSaved(new Date());
        } catch (error) {
            console.error(error);
            // Implementasi feedback error tanpa menggunakan alert browser
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[300px] flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-[#0078C1]" />
                <p className="text-sm font-medium text-[#003366] animate-pulse">Menyiapkan Konfigurasi...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
            {/* Header Section */}
            <div className="flex flex-col gap-1 mb-2">
                <h2 className="text-3xl font-extrabold tracking-tight text-[#003366]">
                    Pengaturan Sistem
                </h2>
                <p className="text-slate-500 font-medium">
                    Kelola kebijakan moderasi dan tata kelola platform akademik.
                </p>
            </div>

            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] overflow-hidden bg-white">
                <CardHeader className="p-8 pb-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#0078C1]/10 p-3 rounded-[16px]">
                            <Shield className="h-6 w-6 text-[#0078C1]" />
                        </div>
                        <div>
                            <CardTitle className="text-[#003366] text-xl font-bold">Tata Kelola Platform</CardTitle>
                            <CardDescription className="font-medium text-slate-400">Kebijakan persetujuan konten akademik.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                
                <CardContent className="p-8 pt-4 space-y-8">
                    {/* Feature Toggle Item */}
                    <div className={`group flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-[24px] border transition-all duration-300 ${
                        moderationEnabled 
                        ? 'bg-[#0078C1]/5 border-[#0078C1]/20' 
                        : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                    }`}>
                        <div className="space-y-1.5 flex-1 pr-4">
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-[#003366]">Moderasi Mata Kuliah</h4>
                                {moderationEnabled && (
                                    <Badge className="bg-[#0078C1] text-white border-none text-[10px] px-2 py-0">AKTIF</Badge>
                                )}
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed max-w-xl font-medium">
                                Jika diaktifkan, semua mata kuliah baru yang diajukan oleh Dosen harus melalui proses verifikasi Admin sebelum dapat diakses oleh Mahasiswa.
                            </p>
                        </div>

                        <div className="mt-4 md:mt-0 flex items-center gap-4 bg-white p-2 rounded-[16px] shadow-sm border border-slate-100">
                            <span className={`text-[11px] font-black uppercase tracking-widest pl-2 ${
                                moderationEnabled ? 'text-[#0078C1]' : 'text-slate-400'
                            }`}>
                                {moderationEnabled ? 'Aktif' : 'Non-aktif'}
                            </span>
                            <button 
                                onClick={() => setModerationEnabled(!moderationEnabled)}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0078C1] focus:ring-offset-2 ${
                                    moderationEnabled ? 'bg-[#0078C1]' : 'bg-slate-300'
                                }`}
                            >
                                <span 
                                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                                        moderationEnabled ? 'translate-x-7' : 'translate-x-1'
                                    }`} 
                                />
                            </button>
                        </div>
                    </div>

                    {/* Additional Settings Hint */}
                    <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-[20px] border border-amber-100/50">
                        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 font-medium leading-relaxed">
                            Perubahan pada kebijakan moderasi akan berdampak langsung pada seluruh Program Studi. Pastikan koordinasi dengan Kepala Prodi telah dilakukan.
                        </p>
                    </div>

                    {/* Footer / Action Area */}
                    <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-50 gap-4">
                        <div className="flex items-center gap-2">
                            {lastSaved && (
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-green-600 animate-in fade-in slide-in-from-left-2">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Berhasil disimpan pukul {lastSaved.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            )}
                        </div>
                        
                        <Button 
                            onClick={handleSave} 
                            disabled={saving} 
                            className="w-full sm:w-auto px-8 py-6 rounded-[16px] bg-[#0078C1] hover:bg-[#003366] text-white font-extrabold shadow-lg shadow-blue-100 transition-all active:scale-95"
                        >
                            {saving ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <Save className="mr-2 h-5 w-5" /> 
                                    Simpan Konfigurasi
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Support Card */}
            <div className="bg-[#003366] rounded-[24px] p-6 text-white flex items-center justify-between overflow-hidden relative">
                <div className="relative z-10">
                    <h5 className="font-bold mb-1">Butuh Bantuan Teknis?</h5>
                    <p className="text-xs text-blue-100/80">Hubungi tim IT Support untuk bantuan konfigurasi sistem lanjut.</p>
                </div>
                <Settings2 className="h-24 w-24 absolute -right-4 -bottom-4 text-white/5 rotate-12" />
                <Button variant="outline" className="relative z-10 bg-white/10 border-white/20 hover:bg-white/20 text-white rounded-[12px] text-xs font-bold">
                    Hubungi IT
                </Button>
            </div>
        </div>
    );
};