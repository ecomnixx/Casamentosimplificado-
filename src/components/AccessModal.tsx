import React, { useState, useMemo } from 'react';
import {
  Lock,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  KeyRound,
  ShieldCheck,
  X,
  Copy,
  Check,
  Smartphone,
  QrCode,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ColorPalette, UserAccess } from '../types';
import { getWhatsAppUrl } from '../utils/helpers';
import { generatePixPayload } from '../utils/pix';

interface AccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  palette: ColorPalette;
  userAccess: UserAccess;
  onUnlockWithCode: (code: string, email: string) => boolean;
  onLockApp: () => void;
}

export const AccessModal: React.FC<AccessModalProps> = ({
  isOpen,
  onClose,
  palette,
  userAccess,
  onUnlockWithCode,
  onLockApp,
}) => {
  const [code, setCode] = useState('');
  const [email, setEmail] = useState(userAccess.brideEmail || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const pixKey = '48519778836';
  const pixKeyFormatted = '485.197.788-36';
  const whatsappNumber = '+55 11 97039-8752';

  const pixCode = useMemo(() => {
    return generatePixPayload({
      key: pixKey,
      name: 'CasamentoFacilitado',
      city: 'SAO PAULO',
      amount: 9.99,
      txid: '***',
    });
  }, [pixKey]);

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!code.trim()) {
      setErrorMsg('Por favor, informe seu código ou senha de acesso.');
      return;
    }

    const success = onUnlockWithCode(code.trim(), email.trim());
    if (success) {
      onClose();
    } else {
      setErrorMsg('Código incorreto ou inválido. Fale conosco no WhatsApp.');
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(pixCode);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2500);
  };

  const handleQuickDemoUnlock = () => {
    onUnlockWithCode('COMPROVANTE-OK', email || 'noiva@casamentofacilitado.com');
    onClose();
  };

  const whatsappUrl = getWhatsAppUrl(
    whatsappNumber,
    `Olá! Acabei de realizar o pagamento de R$ 9,99 do Casamento Facilitado via Pix (Chave: 48519778836). Segue meu comprovante de pagamento!`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-[32px] bg-white p-6 sm:p-7 shadow-2xl border overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ borderColor: palette.primary + '30' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="text-center pt-2 pb-3">
          <div
            className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 shadow-xs border"
            style={{
              backgroundColor: palette.primaryLight,
              borderColor: palette.primary + '30',
              color: palette.primary,
            }}
          >
            {userAccess.isUnlocked ? (
              <CheckCircle2 className="w-8 h-8" />
            ) : (
              <Lock className="w-8 h-8" />
            )}
          </div>

          <span
            className="text-[11px] font-bold tracking-[0.2em] uppercase"
            style={{ color: palette.primary }}
          >
            {userAccess.isUnlocked ? 'ACESSO VIP ATIVO' : 'ASSISTENTE DA NOIVA'}
          </span>
          <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            {userAccess.isUnlocked ? 'Seu Plano está Liberado!' : 'Desbloqueie o Casamento Facilitado'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xs mx-auto">
            {userAccess.isUnlocked
              ? 'Você tem acesso vitalício e ilimitado a todas as ferramentas, orçamentos, fornecedores e checklists.'
              : 'Tenha o controle total do seu casamento por um valor único de R$ 9,99.'}
          </p>
        </div>

        {/* Pricing badge */}
        {!userAccess.isUnlocked && (
          <div
            className="p-3.5 rounded-2xl mb-4 text-center border"
            style={{
              backgroundColor: palette.badgeBg,
              borderColor: palette.primary + '30',
            }}
          >
            <div className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
              Acesso Vitalício &amp; Sem Mensalidades
            </div>
            <div className="flex items-center justify-center gap-1.5 my-0.5">
              <span className="text-xs font-semibold text-stone-400 line-through">R$ 49,90</span>
              <span
                className="font-serif-display text-3xl sm:text-4xl font-extrabold"
                style={{ color: palette.primaryDark }}
              >
                R$ 9,99
              </span>
              <span className="text-xs font-medium text-stone-600">taxa única</span>
            </div>
            <p className="text-[11px] text-stone-600">
              Sem mensalidades. O app será seu assistente pessoal até o grande dia!
            </p>
          </div>
        )}

        {/* QR Code and Payment section when not unlocked */}
        {!userAccess.isUnlocked && (
          <div className="mb-5 space-y-3.5">
            {/* Real QR Code Box */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center flex flex-col items-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 mb-2.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pague com o QR Code no app do banco</span>
              </div>

              <div className="p-2.5 bg-white rounded-2xl shadow-2xs border border-stone-200">
                <QRCodeSVG value={pixCode} size={160} level="M" />
              </div>

              <div className="mt-2.5 text-center">
                <div className="text-[10px] uppercase font-bold text-stone-500">
                  Chave Pix (CPF)
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <span className="font-mono text-xs font-bold text-stone-900 bg-white px-2 py-1 rounded-lg border border-stone-200">
                    {pixKey}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all text-white"
                    style={{ backgroundColor: copiedKey ? '#059669' : palette.buttonBg }}
                  >
                    {copiedKey ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey ? 'Copiada!' : 'Copiar'}</span>
                  </button>
                </div>
                <span className="text-[10px] text-stone-500 block mt-0.5">
                  {pixKeyFormatted}
                </span>
              </div>
            </div>

            {/* Pix Copia e Cola */}
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={pixCode}
                className="flex-1 text-[10px] font-mono text-stone-600 bg-white px-2.5 py-1.5 rounded-lg border border-stone-200 truncate focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyPayload}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shrink-0 flex items-center gap-1"
                style={{ backgroundColor: copiedPayload ? '#059669' : palette.buttonBg }}
              >
                {copiedPayload ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPayload ? 'Copiado' : 'Copiar Código'}</span>
              </button>
            </div>

            {/* WhatsApp receipt instruction */}
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-950 space-y-1">
              <span className="font-bold flex items-center gap-1 text-emerald-800">
                <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-white" />
                Envio Obrigatório de Comprovante:
              </span>
              <p>
                Envie o comprovante de <strong>R$ 9,99</strong> para o WhatsApp{' '}
                <strong>{whatsappNumber}</strong>. Após enviar, dê OK abaixo para liberar seu acesso!
              </p>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-98 transition-all"
              style={{ backgroundColor: '#25D366' }}
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>1. Enviar Comprovante no WhatsApp ({whatsappNumber})</span>
            </a>

            <button
              type="button"
              onClick={handleQuickDemoUnlock}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs flex items-center justify-center gap-1.5 transition-all"
              style={{ backgroundColor: palette.buttonBg }}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>2. Já enviei o comprovante! Dar OK e Liberar</span>
            </button>
          </div>
        )}

        {/* Code Activation Form */}
        <div className="pt-3 border-t border-stone-100">
          <form onSubmit={handleUnlock} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {userAccess.isUnlocked ? 'Chave de Acesso Atual' : 'Já tem seu Código de Acesso / Chave?'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ex: NOIVA2027 ou seu código recebido"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  disabled={userAccess.isUnlocked}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:border-transparent"
                  // @ts-ignore
                  style={{ '--tw-ring-color': palette.primary }}
                />
                <KeyRound className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
              </div>
              {errorMsg && <p className="text-xs text-rose-500 font-medium mt-1">{errorMsg}</p>}
            </div>

            {!userAccess.isUnlocked && (
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-xs transition-opacity hover:opacity-90"
                style={{ backgroundColor: palette.buttonBg }}
              >
                Ativar com Chave / Senha
              </button>
            )}
          </form>

          {/* Guarantee Footer */}
          <div className="mt-4 pt-3 border-t border-stone-100 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-stone-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pagamento 100% Seguro via Pix (R$ 9,99)</span>
            </div>
            {userAccess.isUnlocked && (
              <button
                onClick={() => {
                  onLockApp();
                  onClose();
                }}
                className="text-xs font-medium text-rose-500 hover:text-rose-700 transition-colors mt-2 block mx-auto"
              >
                Sair da conta / Fazer novo login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
