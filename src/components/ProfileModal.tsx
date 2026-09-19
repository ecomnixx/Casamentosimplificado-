import React, { useState, useEffect } from 'react';
import {
  Heart,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  X,
  Check,
  ShieldCheck,
  Search,
  ExternalLink,
  Users,
  Sparkles,
  LogOut,
  Navigation,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { BrideProfile, ColorPalette } from '../types';
import {
  searchAddressSuggestions,
  buildGoogleMapsUrl,
  buildGoogleMapsEmbedUrl,
  AddressSuggestion,
} from '../utils/mapsHelper';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BrideProfile;
  palette: ColorPalette;
  userEmail?: string;
  onSaveProfile: (newProfile: BrideProfile) => void;
  onLogout?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  palette,
  userEmail,
  onSaveProfile,
  onLogout,
}) => {
  const [brideName, setBrideName] = useState(profile.brideName);
  const [groomName, setGroomName] = useState(profile.groomName);
  const [weddingDate, setWeddingDate] = useState(profile.weddingDate);
  const [weddingTime, setWeddingTime] = useState(profile.weddingTime || '16:30');
  const [location, setLocation] = useState(profile.location || '');
  const [venueAddress, setVenueAddress] = useState(profile.venueAddress || '');
  const [venueGoogleMapsUrl, setVenueGoogleMapsUrl] = useState(profile.venueGoogleMapsUrl || '');
  const [estimatedBudget, setEstimatedBudget] = useState(String(profile.estimatedBudget || ''));
  const [guestCount, setGuestCount] = useState(String(profile.guestCount || ''));
  const [weddingStyle, setWeddingStyle] = useState(profile.weddingStyle || '');
  const [notes, setNotes] = useState(profile.notes || '');

  // Google Maps address lookup states
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [showMapPreview, setShowMapPreview] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Sync state if profile changes
  useEffect(() => {
    if (isOpen) {
      setBrideName(profile.brideName);
      setGroomName(profile.groomName);
      setWeddingDate(profile.weddingDate);
      setWeddingTime(profile.weddingTime || '16:30');
      setLocation(profile.location || '');
      setVenueAddress(profile.venueAddress || '');
      setVenueGoogleMapsUrl(profile.venueGoogleMapsUrl || '');
      setEstimatedBudget(String(profile.estimatedBudget || ''));
      setGuestCount(String(profile.guestCount || ''));
      setWeddingStyle(profile.weddingStyle || '');
      setNotes(profile.notes || '');
      setShowLogoutConfirm(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  // Search address suggestions on demand
  const handleSearchAddress = async (queryText?: string) => {
    const q = queryText || location || venueAddress;
    if (!q || q.trim().length < 2) return;

    setIsSearchingAddress(true);
    try {
      const results = await searchAddressSuggestions(q);
      setAddressSuggestions(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const handleSelectSuggestion = (s: AddressSuggestion) => {
    setVenueAddress(s.displayName);
    const mapsUrl = s.mapsUrl || buildGoogleMapsUrl(s.displayName);
    setVenueGoogleMapsUrl(mapsUrl);
    setAddressSuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const activeMapsUrl =
      venueGoogleMapsUrl ||
      (venueAddress ? buildGoogleMapsUrl(venueAddress) : location ? buildGoogleMapsUrl(location) : '');

    onSaveProfile({
      brideName: brideName.trim() || 'Noiva',
      groomName: groomName.trim() || 'Noivo',
      weddingDate: weddingDate || '2027-05-15',
      weddingTime: weddingTime || '16:30',
      location: location.trim(),
      venueAddress: venueAddress.trim(),
      venueGoogleMapsUrl: activeMapsUrl,
      estimatedBudget: parseFloat(estimatedBudget) || 0,
      guestCount: parseInt(guestCount, 10) || 0,
      weddingStyle: weddingStyle.trim(),
      notes: notes.trim(),
    });
    onClose();
  };

  const activeGoogleMapsTarget = venueAddress || location;
  const currentGoogleMapsUrl = activeGoogleMapsTarget
    ? buildGoogleMapsUrl(activeGoogleMapsTarget)
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-[32px] bg-white p-5 sm:p-7 shadow-2xl border overflow-hidden max-h-[92vh] overflow-y-auto"
        style={{ borderColor: palette.primary + '30' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="text-center pb-3.5 border-b border-stone-100">
          <div
            className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-2 shadow-xs border"
            style={{
              backgroundColor: palette.primaryLight,
              borderColor: palette.primary + '30',
              color: palette.primary,
            }}
          >
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <span
            className="text-[11px] font-bold tracking-[0.2em] uppercase"
            style={{ color: palette.primary }}
          >
            DADOS DO CASAMENTO
          </span>
          <h3 className="font-serif-display text-2xl font-bold text-stone-900 mt-0.5">
            Configurar Meus Dados
          </h3>
          <p className="text-xs text-stone-500">
            Nomes dos noivos, data, local no Google Maps e detalhes da cerimônia.
          </p>

          {userEmail && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cadastro Particular:</span>
              <strong className="font-semibold text-emerald-950 truncate max-w-[200px]">{userEmail}</strong>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-3.5">
          {/* Nomes dos Noivos */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nome da Noiva *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Mariana"
                value={brideName}
                onChange={(e) => setBrideName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nome do Noivo *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Rafael"
                value={groomName}
                onChange={(e) => setGroomName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2"
              />
            </div>
          </div>

          {/* Data e Horário */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Data do Casamento *
              </label>
              <input
                type="date"
                required
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Horário da Cerimônia
              </label>
              <input
                type="time"
                value={weddingTime}
                onChange={(e) => setWeddingTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono focus:outline-none focus:ring-2"
              />
            </div>
          </div>

          {/* LOCAL DO CASAMENTO E GOOGLE MAPS */}
          <div className="p-3 rounded-2xl bg-stone-50/80 border border-stone-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Local do Casamento (Google Maps)</span>
              </label>
              {activeGoogleMapsTarget && (
                <a
                  href={currentGoogleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <span>Abrir no Google Maps</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>

            <div>
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Nome do local / igreja / espaço (Ex: Villa Bisutti, Espaço Jardim...)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 bg-white"
                  />
                  <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                </div>
                <button
                  type="button"
                  onClick={() => handleSearchAddress()}
                  disabled={isSearchingAddress}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1 shrink-0 shadow-2xs hover:opacity-90 active:scale-98 transition-all"
                  style={{ backgroundColor: palette.buttonBg }}
                  title="Buscar endereço completo no Google / Mapas"
                >
                  {isSearchingAddress ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Search className="w-3.5 h-3.5" />
                  )}
                  <span>Buscar</span>
                </button>
              </div>
            </div>

            {/* Address Suggestions List */}
            {addressSuggestions.length > 0 && (
              <div className="p-2 bg-white rounded-xl border border-blue-200 shadow-sm space-y-1 animate-in fade-in duration-150">
                <div className="text-[10px] uppercase font-bold text-blue-800 px-1.5 pt-0.5 flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-blue-600" />
                  <span>Selecione o Endereço Literal Encontrado:</span>
                </div>
                {addressSuggestions.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectSuggestion(sug)}
                    className="w-full text-left p-2 rounded-lg text-[11px] text-stone-700 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors flex items-start gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{sug.displayName}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Endereço Literal Exato */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Endereço Completo Literal (Rua, Número, Bairro, Cidade - UF):
              </label>
              <input
                type="text"
                placeholder="Ex: Rua Quatá, 611 - Vila Olímpia, São Paulo - SP"
                value={venueAddress}
                onChange={(e) => {
                  setVenueAddress(e.target.value);
                  setVenueGoogleMapsUrl(buildGoogleMapsUrl(e.target.value));
                }}
                className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 bg-white"
              />
            </div>

            {/* Google Maps Verified Box */}
            {activeGoogleMapsTarget && (
              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Endereço Vinculado ao Google Maps</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMapPreview(!showMapPreview)}
                    className="text-[10px] text-blue-700 hover:underline font-semibold"
                  >
                    {showMapPreview ? 'Ocultar Mapa' : 'Ver Prévia do Mapa'}
                  </button>
                </div>

                <p className="text-[11px] text-stone-700 font-medium leading-relaxed">
                  {venueAddress || location}
                </p>

                <div className="flex gap-2 pt-0.5">
                  <a
                    href={currentGoogleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-2xs transition-all"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Traçar Rota no Google Maps</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>

                  <a
                    href={`https://waze.com/ul?q=${encodeURIComponent(activeGoogleMapsTarget)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-[11px] shadow-2xs transition-all"
                  >
                    <span>Abrir no Waze</span>
                  </a>
                </div>

                {/* Embedded Map Preview */}
                {showMapPreview && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-blue-200 h-44 w-full shadow-inner animate-in fade-in duration-200">
                    <iframe
                      title="Google Maps Preview"
                      width="100%"
                      height="100%"
                      loading="lazy"
                      src={buildGoogleMapsEmbedUrl(activeGoogleMapsTarget)}
                      className="border-0 w-full h-full"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Orçamento e Convidados */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Meta de Orçamento (R$)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="100"
                  placeholder="50000"
                  value={estimatedBudget}
                  onChange={(e) => setEstimatedBudget(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-200 text-xs font-mono focus:outline-none focus:ring-2"
                />
                <DollarSign className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Total de Convidados
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="150"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-200 text-xs font-mono focus:outline-none focus:ring-2"
                />
                <Users className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Estilo do Casamento */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Estilo / Tema do Casamento
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: Boho Chic Romântico, Rústico, Clássico..."
                value={weddingStyle}
                onChange={(e) => setWeddingStyle(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2"
              />
              <Sparkles className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Notas Românticas */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Mensagem ou Notas dos Noivos
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Nossa história, votos, lembretes especiais..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
            {onLogout ? (
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 flex items-center gap-1.5 transition-all"
                title="Sair do aplicativo"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair do App</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 hover:opacity-95 active:scale-98 transition-all"
                style={{ backgroundColor: palette.buttonBg }}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </form>

        {/* Confirmation Modal for Logout */}
        {showLogoutConfirm && (
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-xs p-6 flex flex-col justify-center items-center text-center animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3 border border-rose-200">
              <LogOut className="w-6 h-6" />
            </div>
            <h4 className="font-serif-display text-xl font-bold text-stone-900">
              Deseja sair do aplicativo?
            </h4>
            <p className="text-xs text-stone-600 mt-1.5 max-w-xs leading-relaxed">
              Todos os seus dados permanecerão salvos com segurança no seu e-mail{' '}
              {userEmail && <strong className="text-stone-900">{userEmail}</strong>}.
            </p>
            <div className="flex gap-2 mt-5 w-full max-w-xs">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onClose();
                  if (onLogout) onLogout();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-xs"
              >
                Sim, Sair
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

