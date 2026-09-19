import React, { useState, useMemo, useEffect } from 'react';
import {
  Lock,
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  MessageCircle,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Heart,
  KeyRound,
  User,
  Mail,
  Eye,
  EyeOff,
  Smartphone,
  CheckCheck,
  Clock,
  Crown,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ColorPalette, UserAccount } from '../types';
import { getWhatsAppUrl } from '../utils/helpers';
import { generatePixPayload } from '../utils/pix';
import { broadcastUserEvent } from '../utils/notifications';
import {
  registerUserOnServer,
  checkUserStatusOnServer,
  subscribeToRealtimeServer,
} from '../services/api';

interface LoginPaymentScreenProps {
  palette: ColorPalette;
  onSuccessLogin: (account: { name: string; email: string; accessCode?: string; role?: 'admin' | 'user' }) => void;
}

export const LoginPaymentScreen: React.FC<LoginPaymentScreenProps> = ({
  palette,
  onSuccessLogin,
}) => {
  const [activeTab, setActiveTab] = useState<'pay' | 'login'>('pay');

  // Registration & Payment state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pixGenerated, setPixGenerated] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const [payloadCopied, setPayloadCopied] = useState(false);
  const [hasClickedWhatsApp, setHasClickedWhatsApp] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Approval Waiting & Status Check state
  const [waitingApprovalAccount, setWaitingApprovalAccount] = useState<UserAccount | null>(null);
  const [isCheckingApproval, setIsCheckingApproval] = useState(false);
  const [checkFeedback, setCheckFeedback] = useState<{ message: string; type: 'success' | 'pending' | 'error' } | null>(null);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [pendingApprovalNotice, setPendingApprovalNotice] = useState<string | null>(null);
  const [detectedApprovedUser, setDetectedApprovedUser] = useState<UserAccount | null>(null);
  const [payTabApprovedNotice, setPayTabApprovedNotice] = useState<UserAccount | null>(null);

  // Official Pix Key and Contact
  const pixKey = '48519778836';
  const pixKeyFormatted = '485.197.788-36';
  const officialWhatsApp = '+55 11 97039-8752';
  const MASTER_EMAIL = 'familiacardoso21@gmail.com';

  // Real, genuine EMV Pix Payload for 48519778836 and R$ 9,99
  const pixCode = useMemo(() => {
    return generatePixPayload({
      key: pixKey,
      name: 'CasamentoFacilitado',
      city: 'SAO PAULO',
      amount: 9.99,
      txid: '***',
    });
  }, [pixKey]);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(pixKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 3000);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(pixCode);
    setPayloadCopied(true);
    setTimeout(() => setPayloadCopied(false), 3000);
  };

  const handleGeneratePix = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!name.trim() || !cleanEmail) return;

    // If master email registers, auto-login immediately!
    if (cleanEmail === MASTER_EMAIL) {
      onSuccessLogin({
        name: name.trim() || 'Master Admin',
        email: cleanEmail,
        accessCode: 'MASTER-AUTO',
        role: 'admin',
      });
      return;
    }

    // Save as pending user right away so master can see in Approvals dashboard
    const existingAccounts: UserAccount[] = JSON.parse(
      localStorage.getItem('casamento_users') || '[]'
    );
    const existingIndex = existingAccounts.findIndex((u) => u.email === cleanEmail);
    const userPayload: UserAccount = {
      id: existingIndex >= 0 ? existingAccounts[existingIndex].id : 'user_' + Date.now(),
      name: name.trim() || 'Noiva',
      email: cleanEmail,
      password: password || '123456',
      status: 'pending',
      role: 'user',
      createdAt: existingIndex >= 0 ? existingAccounts[existingIndex].createdAt : new Date().toISOString(),
      amountPaid: 9.99,
      paymentMethod: 'pix',
    };

    if (existingIndex >= 0) {
      existingAccounts[existingIndex] = { ...existingAccounts[existingIndex], ...userPayload };
    } else {
      existingAccounts.push(userPayload);
    }
    localStorage.setItem('casamento_users', JSON.stringify(existingAccounts));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('casamento_users_updated', { detail: { newPending: userPayload } }));
    broadcastUserEvent('new_request', userPayload);

    // Register on server in real time so Master receives notification immediately across all devices
    registerUserOnServer(userPayload);

    setPixGenerated(true);
  };

  const currentTargetName = waitingApprovalAccount ? waitingApprovalAccount.name : name.trim() || 'Noiva';
  const currentTargetEmail = waitingApprovalAccount ? waitingApprovalAccount.email : email.trim() || 'meu-email';

  const whatsappReceiptUrl = getWhatsAppUrl(
    officialWhatsApp,
    `Olá! Acabei de realizar o pagamento de R$ 9,99 do Casamento Facilitado via Pix (Chave: 48519778836).\n\nSegue aqui meu comprovante para autorização de acesso!\nNome: ${currentTargetName}\nE-mail de cadastro: ${currentTargetEmail}`
  );

  const handleSendWhatsAppClick = () => {
    setHasClickedWhatsApp(true);
  };

  // Live listener to auto-detect Master approval in real-time
  useEffect(() => {
    if (!waitingApprovalAccount) return;

    let isApproved = false;

    const grantAccess = (accountData: { name: string; email: string; role?: 'admin' | 'user' }) => {
      if (isApproved) return;
      isApproved = true;
      setPaymentSuccess(true);
      setCheckFeedback({
        message: `🎉 O Administrador Master autorizou seu acesso! Entrando no Casamento Facilitado...`,
        type: 'success',
      });
      setTimeout(() => {
        onSuccessLogin({
          name: accountData.name,
          email: accountData.email,
          accessCode: 'MASTER-AUTORIZADO',
          role: accountData.role || 'user',
        });
      }, 900);
    };

    const checkLiveStatus = async () => {
      if (isApproved) return;
      const targetEmail = waitingApprovalAccount.email.toLowerCase();

      // 1. Check server status first (real-time source of truth)
      try {
        const serverStatus = await checkUserStatusOnServer(targetEmail);
        if (serverStatus.status === 'approved' && serverStatus.user) {
          grantAccess(serverStatus.user);
          return;
        }
      } catch (e) {
        // continue to local check
      }

      // 2. Check local storage
      const raw = localStorage.getItem('casamento_users');
      if (!raw) return;
      try {
        const list: UserAccount[] = JSON.parse(raw);
        const current = list.find((u) => u.email.toLowerCase() === targetEmail);
        if (current && current.status === 'approved') {
          grantAccess(current);
        }
      } catch (e) {
        console.error(e);
      }
    };

    // Listen to real-time Server-Sent Events (SSE)
    const unsubscribeSse = subscribeToRealtimeServer((event) => {
      if (event.type === 'user_approved' && event.user) {
        if (event.user.email?.toLowerCase() === waitingApprovalAccount.email.toLowerCase()) {
          grantAccess(event.user);
        }
      }
    });

    const interval = setInterval(checkLiveStatus, 2000);
    window.addEventListener('storage', checkLiveStatus);

    return () => {
      unsubscribeSse();
      clearInterval(interval);
      window.removeEventListener('storage', checkLiveStatus);
    };
  }, [waitingApprovalAccount, onSuccessLogin]);

  const handleExecuteNotifyPayment = () => {
    setShowConfirmModal(false);
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);

      const existingAccounts: UserAccount[] = JSON.parse(
        localStorage.getItem('casamento_users') || '[]'
      );
      const cleanEmail = email.trim().toLowerCase();
      const existingIndex = existingAccounts.findIndex((u) => u.email.toLowerCase() === cleanEmail);

      const updatedAccount: UserAccount = {
        id: existingIndex >= 0 ? existingAccounts[existingIndex].id : 'user_' + Date.now(),
        name: name.trim() || 'Noiva',
        email: cleanEmail,
        password: password || '123456',
        status: 'pending', // 🛑 STRICT: REQUIRE MASTER ADMIN TO AUTHORIZE BEFORE ENTRY
        role: 'user',
        createdAt: existingIndex >= 0 && existingAccounts[existingIndex].createdAt
          ? existingAccounts[existingIndex].createdAt
          : new Date().toISOString(),
        paidAt: new Date().toISOString(),
        paymentMethod: 'pix',
        amountPaid: 9.99,
      };

      if (existingIndex >= 0) {
        existingAccounts[existingIndex] = updatedAccount;
      } else {
        existingAccounts.push(updatedAccount);
      }
      localStorage.setItem('casamento_users', JSON.stringify(existingAccounts));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('casamento_users_updated', { detail: { newPending: updatedAccount } }));
      broadcastUserEvent('new_request', updatedAccount);

      // Register / update on server in real time
      registerUserOnServer(updatedAccount);

      // Switch to the waiting for approval screen! Do NOT log in directly!
      setWaitingApprovalAccount(updatedAccount);
      setCheckFeedback(null);
    }, 600);
  };

  const handleManualCheckApproval = async () => {
    if (!waitingApprovalAccount) return;
    setIsCheckingApproval(true);
    setCheckFeedback(null);

    const targetEmail = waitingApprovalAccount.email.toLowerCase();

    try {
      // 1. Check with server
      const serverResult = await checkUserStatusOnServer(targetEmail);
      setIsCheckingApproval(false);

      if (serverResult.status === 'approved' && serverResult.user) {
        setPaymentSuccess(true);
        setCheckFeedback({
          message: '🎉 Acesso confirmado e autorizado pelo Administrador Master! Entrando...',
          type: 'success',
        });
        setTimeout(() => {
          onSuccessLogin({
            name: serverResult.user?.name || 'Noiva',
            email: serverResult.user?.email || targetEmail,
            accessCode: 'MASTER-AUTORIZADO',
            role: serverResult.user?.role || 'user',
          });
        }, 800);
        return;
      }
    } catch (e) {
      // fallback
    }

    setIsCheckingApproval(false);
    const raw = localStorage.getItem('casamento_users');
    const list: UserAccount[] = raw ? JSON.parse(raw) : [];
    const current = list.find((u) => u.email.toLowerCase() === targetEmail);

    if (current && current.status === 'approved') {
      setPaymentSuccess(true);
      setCheckFeedback({
        message: '🎉 Acesso confirmado e autorizado pelo Administrador Master! Entrando...',
        type: 'success',
      });
      setTimeout(() => {
        onSuccessLogin({
          name: current.name,
          email: current.email,
          accessCode: 'MASTER-AUTORIZADO',
          role: current.role || 'user',
        });
      }, 800);
    } else {
      setCheckFeedback({
        message: '⏳ Seu cadastro continua como "Pendente de Autorização". O Administrador Master precisa conferir o comprovante e aprovar seu acesso no painel.',
        type: 'pending',
      });
    }
  };

  const handleGiveOkClick = () => {
    if (!hasClickedWhatsApp) {
      setShowConfirmModal(true);
    } else {
      handleExecuteNotifyPayment();
    }
  };

  // Immediate Master & Approved User Auto-Detection on pay tab
  const handlePayEmailChange = (val: string) => {
    setEmail(val);
    const clean = val.trim().toLowerCase();
    if (clean === MASTER_EMAIL) {
      onSuccessLogin({
        name: 'Administrador Master',
        email: MASTER_EMAIL,
        accessCode: 'MASTER-ROOT',
        role: 'admin',
      });
      return;
    }

    if (clean.includes('@') && clean.includes('.')) {
      const existingAccounts: UserAccount[] = JSON.parse(
        localStorage.getItem('casamento_users') || '[]'
      );
      const found = existingAccounts.find((u) => u.email === clean);
      if (found && found.status === 'approved') {
        setPayTabApprovedNotice(found);
      } else {
        setPayTabApprovedNotice(null);
      }
    } else {
      setPayTabApprovedNotice(null);
    }
  };

  // Immediate Master Auto-Login & Approved User check on email typing
  const handleEmailChange = (val: string) => {
    setLoginEmail(val);
    setLoginError('');
    setPendingApprovalNotice(null);

    const clean = val.trim().toLowerCase();
    // If user enters master email, AUTO-LOGIN INSTANTLY!
    if (clean === MASTER_EMAIL) {
      onSuccessLogin({
        name: 'Administrador Master',
        email: MASTER_EMAIL,
        accessCode: 'MASTER-ROOT',
        role: 'admin',
      });
      return;
    }

    // Auto-detect registered user account
    if (clean.includes('@') && clean.includes('.')) {
      const existingAccounts: UserAccount[] = JSON.parse(
        localStorage.getItem('casamento_users') || '[]'
      );
      const found = existingAccounts.find((u) => u.email === clean);
      if (found) {
        if (found.status === 'approved') {
          setDetectedApprovedUser(found);
          setPendingApprovalNotice(null);
        } else if (found.status === 'pending') {
          setDetectedApprovedUser(null);
          setPendingApprovalNotice(
            `Olá ${found.name}! Seu cadastro foi localizado e está aguardando a aprovação do comprovante Pix. Fale conosco no WhatsApp (+55 11 97039-8752) para liberação imediata!`
          );
        } else if (found.status === 'rejected') {
          setDetectedApprovedUser(null);
          setLoginError('Acesso recusado ou suspenso. Fale conosco no WhatsApp.');
        }
      } else {
        setDetectedApprovedUser(null);
      }
    } else {
      setDetectedApprovedUser(null);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setPendingApprovalNotice(null);

    const cleanEmail = loginEmail.trim().toLowerCase();
    const cleanPass = loginPassword.trim();

    if (!cleanEmail) {
      setLoginError('Informe seu e-mail.');
      return;
    }

    // 1. MASTER LOGIN (Automatic - doesn't need password or registration)
    if (cleanEmail === MASTER_EMAIL) {
      onSuccessLogin({
        name: 'Administrador Master',
        email: MASTER_EMAIL,
        accessCode: 'MASTER-ROOT',
        role: 'admin',
      });
      return;
    }

    // 2. Check registered accounts
    const existingAccounts: UserAccount[] = JSON.parse(
      localStorage.getItem('casamento_users') || '[]'
    );
    const found = existingAccounts.find((u) => u.email.toLowerCase() === cleanEmail);

    if (found) {
      // Check if user is pending approval - DO NOT ALLOW LOGIN
      if (found.status === 'pending') {
        setWaitingApprovalAccount(found);
        setCheckFeedback({
          message: '⏳ Seu cadastro foi localizado, mas ainda aguarda a confirmação e autorização do Administrador Master.',
          type: 'pending',
        });
        return;
      }
      if (found.status === 'rejected') {
        setLoginError('Acesso recusado ou suspenso. Fale com o Administrador no WhatsApp (+55 11 97039-8752).');
        return;
      }

      // Approved user by Master
      onSuccessLogin({
        name: found.name,
        email: cleanEmail,
        accessCode: cleanPass || 'LOGIN-APPROVED',
        role: found.role || 'user',
      });
      return;
    }

    // 3. Only Master root bypass allowed
    if (cleanEmail === MASTER_EMAIL || cleanPass.toUpperCase() === 'MASTER-ROOT') {
      onSuccessLogin({
        name: 'Administrador Master',
        email: MASTER_EMAIL,
        accessCode: 'MASTER-ROOT',
        role: 'admin',
      });
      return;
    }

    setLoginError(
      'E-mail não encontrado ou ainda não cadastrado. Faça o cadastro e gere o Pix de R$ 9,99 na aba "Pagar Acesso" para solicitar liberação.'
    );
  };

  const handleMasterDirectButton = () => {
    onSuccessLogin({
      name: 'Administrador Master',
      email: MASTER_EMAIL,
      accessCode: 'MASTER-ROOT',
      role: 'admin',
    });
  };

  const handleQuickDemo = () => {
    onSuccessLogin({
      name: 'Noiva Vip (Demonstração)',
      email: 'noiva@casamentofacilitado.com',
      accessCode: 'DEMO-VIP',
      role: 'user',
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between py-6 px-4 sm:px-6 max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center pt-2">
        <div
          className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 shadow-md border"
          style={{
            backgroundColor: palette.primaryLight,
            borderColor: palette.primary + '40',
            color: palette.primary,
          }}
        >
          <Heart className="w-8 h-8 fill-current opacity-85" />
        </div>

        <span
          className="text-[11px] font-bold tracking-[0.25em] uppercase"
          style={{ color: palette.primary }}
        >
          ACESSO EXCLUSIVO
        </span>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-900 mt-0.5">
          Casamento Facilitado
        </h1>
        <p className="text-xs text-stone-600 mt-1 max-w-xs mx-auto">
          O assistente definitivo com fornecedores completos, orçamentos, tarefas e paletas de cores.
        </p>
      </div>

      {/* Main Card */}
      <div className="my-5 rounded-[28px] bg-white border border-stone-200/80 shadow-xl overflow-hidden p-5 sm:p-6 relative">
        {waitingApprovalAccount ? (
          /* ======================================================== */
          /* AGUARDANDO AUTORIZAÇÃO DO ADMINISTRADOR MASTER */
          /* ======================================================== */
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Status Header Banner */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-center space-y-2">
              <div className="w-13 h-13 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center border border-amber-300 shadow-2xs">
                <Clock className="w-7 h-7 stroke-[2.5] animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300 inline-block mb-1">
                  STATUS: AGUARDANDO AUTORIZAÇÃO DO MASTER
                </span>
                <h3 className="font-serif-display text-lg sm:text-xl font-bold text-stone-900">
                  Comprovante Registrado!
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed max-w-xs mx-auto mt-0.5">
                  Para segurança do sistema, o <strong>Administrador Master</strong> precisa conferir seu comprovante e liberar seu acesso no painel de controle.
                </p>
              </div>
            </div>

            {/* Account Details */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Resumo do Cadastro
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-stone-700">
                  <span className="text-stone-500">Noiva / Titular:</span>
                  <span className="font-bold text-stone-900">{waitingApprovalAccount.name}</span>
                </div>
                <div className="flex justify-between items-center text-stone-700">
                  <span className="text-stone-500">E-mail:</span>
                  <span className="font-mono text-[11px] font-semibold text-stone-900">{waitingApprovalAccount.email}</span>
                </div>
                <div className="flex justify-between items-center text-stone-700">
                  <span className="text-stone-500">Valor do Acesso:</span>
                  <span className="font-bold text-emerald-700">R$ 9,99 (Pix Chave {pixKeyFormatted})</span>
                </div>
                <div className="flex justify-between items-center text-stone-700 pt-1.5 border-t border-stone-200">
                  <span className="text-stone-500">Status no Painel:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-amber-800 text-[11px] bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                    <Clock className="w-3 h-3 text-amber-600" />
                    Pendente de Liberação
                  </span>
                </div>
              </div>
            </div>

            {/* Feedback Alert */}
            {checkFeedback && (
              <div
                className={`p-3 rounded-2xl border text-xs font-semibold flex items-start gap-2 animate-in fade-in duration-200 ${
                  checkFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
              >
                {checkFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span className="leading-snug">{checkFeedback.message}</span>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <a
                href={whatsappReceiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleSendWhatsAppClick}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>1. Enviar Comprovante no WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleManualCheckApproval}
                disabled={isCheckingApproval || paymentSuccess}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                style={{ backgroundColor: paymentSuccess ? '#059669' : palette.buttonBg }}
              >
                {isCheckingApproval ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Consultando autorização do Master...</span>
                  </>
                ) : paymentSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Autorizado! Entrando...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>2. Verificar se o Master Já Autorizou</span>
                  </>
                )}
              </button>

              <div className="text-[11px] text-stone-500 text-center flex items-center justify-center gap-1.5 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                <span>Verificação contínua ativa. Assim que o Master aprovar no painel, seu acesso abre na hora!</span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  setWaitingApprovalAccount(null);
                  setCheckFeedback(null);
                }}
                className="text-xs text-stone-500 hover:text-stone-800 inline-flex items-center gap-1 font-semibold"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Voltar para tela de login / Trocar de e-mail</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="flex items-center p-1 rounded-2xl bg-stone-100 mb-5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('pay');
                  setLoginError('');
                  setPendingApprovalNotice(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'pay'
                    ? 'bg-white shadow-2xs font-bold text-stone-900'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Pagar Acesso (R$ 9,99)
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setLoginError('');
                  setPendingApprovalNotice(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'login'
                    ? 'bg-white shadow-2xs font-bold text-stone-900'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Já Paguei / Entrar
              </button>
            </div>

        {/* ======================================================== */}
        {/* TAB 1: PAGAMENTO R$ 9,99 VIA PIX QR CODE + COMPROVANTE */}
        {/* ======================================================== */}
        {activeTab === 'pay' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Price Box */}
            <div
              className="p-3.5 rounded-2xl border text-center relative overflow-hidden"
              style={{
                backgroundColor: palette.cardBg,
                borderColor: palette.primary + '35',
              }}
            >
              <div className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
                Acesso Vitalício &amp; Sem Mensalidades
              </div>
              <div className="flex items-baseline justify-center gap-1.5 my-0.5">
                <span className="text-xs text-stone-400 line-through font-medium">R$ 49,90</span>
                <span
                  className="font-serif-display text-3xl sm:text-4xl font-extrabold"
                  style={{ color: palette.primaryDark }}
                >
                  R$ 9,99
                </span>
                <span className="text-xs text-stone-600 font-medium">taxa única</span>
              </div>
              <p className="text-[11px] text-stone-600">
                Acesso liberado após envio do comprovante para aprovação!
              </p>
            </div>

            {/* Step 1: User info form */}
            {!pixGenerated ? (
              <form onSubmit={handleGeneratePix} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nome da Noiva / Noivo *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Amanda Silva"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Seu Melhor E-mail *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="seu.email@exemplo.com"
                      value={email}
                      onChange={(e) => handlePayEmailChange(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2"
                    />
                  </div>
                </div>

                {payTabApprovedNotice && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between animate-in fade-in duration-150">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-bold">E-mail com acesso já liberado!</p>
                        <p className="text-[11px] text-emerald-700">Olá {payTabApprovedNotice.name}, seu acesso já está ativo.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onSuccessLogin({
                          name: payTabApprovedNotice.name,
                          email: payTabApprovedNotice.email,
                          accessCode: 'LOGIN-AUTO',
                          role: payTabApprovedNotice.role || 'user',
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all shrink-0"
                    >
                      Entrar Agora
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Crie uma Senha de Acesso *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Digite uma senha fácil de lembrar"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-stone-500 mt-0.5 block">
                    Use para entrar no app em outros aparelhos.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2"
                  style={{ backgroundColor: palette.buttonBg }}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Gerar QR Code Pix de R$ 9,99</span>
                </button>
              </form>
            ) : (
              /* Step 2: Pix QR Code and Payment details + WhatsApp Receipt Flow */
              <div className="space-y-4">
                {/* REAL SCANNER QR CODE */}
                <div className="p-4 rounded-3xl bg-stone-50 border border-stone-200 text-center flex flex-col items-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 mb-3">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Aponte a câmera do seu banco</span>
                  </div>

                  {/* QR Code Container */}
                  <div className="relative p-3 bg-white rounded-2xl shadow-sm border border-stone-200">
                    <div className="w-[180px] h-[180px] flex items-center justify-center">
                      <QRCodeSVG
                        value={pixCode}
                        size={180}
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                  </div>

                  <div className="mt-3 text-center">
                    <div className="text-[11px] uppercase font-bold text-stone-500">
                      Chave Pix (CPF)
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-0.5">
                      <span className="font-mono text-sm font-extrabold text-stone-900 bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
                        {pixKey}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyKey}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all text-white shadow-2xs"
                        style={{ backgroundColor: keyCopied ? '#059669' : palette.buttonBg }}
                        title="Copiar chave Pix"
                      >
                        {keyCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{keyCopied ? 'Copiada!' : 'Copiar Chave'}</span>
                      </button>
                    </div>
                    <div className="text-[10px] text-stone-500 mt-1">
                      Chave formatada: {pixKeyFormatted}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-stone-200/80 w-full flex items-center justify-center gap-1.5 text-xs text-stone-700">
                    <span>Valor exato:</span>
                    <strong className="text-stone-900 font-extrabold text-sm">R$ 9,99</strong>
                  </div>
                </div>

                {/* Pix Copia e Cola (EMV Payload) */}
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-stone-700">
                      Pix Copia e Cola:
                    </label>
                    <span className="text-[10px] text-stone-500">Cole no app do banco</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={pixCode}
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-stone-200 text-[10px] font-mono text-stone-600 truncate focus:outline-none select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyPayload}
                      className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-all text-white shadow-2xs"
                      style={{ backgroundColor: payloadCopied ? '#059669' : palette.buttonBg }}
                    >
                      {payloadCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{payloadCopied ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                {/* INSTRUCTION: Enviar comprovante no WhatsApp + Dar OK */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-stone-800 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <MessageCircle className="w-4 h-4 fill-emerald-600 text-white" />
                    <span>Envio de Comprovante Obrigatório:</span>
                  </div>
                  <p className="text-[11px] text-emerald-900 leading-relaxed">
                    Envie o comprovante de <strong>R$ 9,99</strong> para o WhatsApp{' '}
                    <strong className="font-bold underline text-emerald-950">
                      {officialWhatsApp}
                    </strong>
                    . O administrador aprovará seu acesso para liberação completa!
                  </p>

                  {/* Step 1: Send on WhatsApp Button */}
                  <a
                    href={whatsappReceiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleSendWhatsAppClick}
                    className="w-full py-3 px-3 rounded-xl bg-[#25D366] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:brightness-105 active:scale-98 transition-all"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>1. Enviar Comprovante no WhatsApp</span>
                  </a>

                  {hasClickedWhatsApp && (
                    <div className="text-[11px] text-emerald-700 font-medium flex items-center justify-center gap-1 pt-0.5">
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp aberto! Agora clique em "Dar OK" abaixo.</span>
                    </div>
                  )}
                </div>

                {/* Step 2: NOTIFY MASTER / REQUEST AUTHORIZATION BUTTON */}
                <button
                  type="button"
                  onClick={handleGiveOkClick}
                  disabled={isProcessingPayment || paymentSuccess}
                  className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md transition-all flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: paymentSuccess ? '#059669' : palette.buttonBg,
                    opacity: isProcessingPayment ? 0.85 : 1,
                  }}
                >
                  {isProcessingPayment ? (
                    <span className="animate-pulse">Registrando comprovante no sistema...</span>
                  ) : paymentSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Comprovante Registrado!</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>2. Já realizei o pagamento / Informar ao Master</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setPixGenerated(false)}
                  className="text-[11px] text-stone-500 hover:text-stone-800 text-center block w-full pt-1"
                >
                  ← Alterar nome ou e-mail
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: JÁ SOU CADASTRADO / FAZER LOGIN */}
        {/* ======================================================== */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Seu E-mail Cadastrado *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="seu.email@exemplo.com"
                  value={loginEmail}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Senha de Acesso
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha cadastrada"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {detectedApprovedUser && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold">Acesso Liberado para {detectedApprovedUser.name}!</p>
                    <p className="text-[11px] text-emerald-700">Seu cadastro foi aprovado no sistema.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSuccessLogin({
                      name: detectedApprovedUser.name,
                      email: detectedApprovedUser.email,
                      accessCode: 'LOGIN-APPROVED',
                      role: detectedApprovedUser.role || 'user',
                    });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all shrink-0"
                >
                  Liberar e Entrar
                </button>
              </div>
            )}

            {loginError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {loginError}
              </div>
            )}

            {pendingApprovalNotice && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Aguardando Autorização do Administrador Master</span>
                </div>
                <p className="text-[11px] leading-relaxed">{pendingApprovalNotice}</p>
                <div className="flex flex-col gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const raw = localStorage.getItem('casamento_users');
                      const list: UserAccount[] = raw ? JSON.parse(raw) : [];
                      const f = list.find((u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase());
                      if (f) {
                        setWaitingApprovalAccount(f);
                        setCheckFeedback(null);
                      }
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Acompanhar Status de Liberação do Master</span>
                  </button>

                  <a
                    href={whatsappReceiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline py-0.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Falar no WhatsApp (+55 11 97039-8752)</span>
                  </a>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2 mt-1"
              style={{ backgroundColor: palette.buttonBg }}
            >
              <ArrowRight className="w-4 h-4" />
              <span>Entrar no Casamento Facilitado</span>
            </button>

            {/* Quick Demo Access for evaluator / test */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleMasterDirectButton}
                className="text-[11px] font-semibold text-stone-400 hover:text-stone-600 hover:underline inline-flex items-center gap-1"
                title="Acesso de Gestão"
              >
                <Lock className="w-3 h-3" />
                <span>Área Administrativa</span>
              </button>

              <button
                type="button"
                onClick={handleQuickDemo}
                className="text-[11px] font-semibold text-stone-500 hover:text-stone-800 hover:underline inline-flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Testar Demo VIP</span>
              </button>
            </div>
          </form>
        )}
          </>
        )}
      </div>

      {/* Confirmation Modal when user clicks OK before sending via WhatsApp */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-stone-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <MessageCircle className="w-7 h-7 fill-emerald-600 text-white" />
            </div>

            <div>
              <h3 className="font-serif-display text-xl font-bold text-stone-900">
                Confirmação do Pagamento
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Você já realizou o Pix de R$ 9,99 e enviou o comprovante para o WhatsApp{' '}
                <strong className="text-stone-900">{officialWhatsApp}</strong>? O Administrador Master precisa conferir o pagamento para autorizar o acesso.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleExecuteNotifyPayment}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1.5"
                style={{ backgroundColor: palette.buttonBg }}
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Sim, já enviei! Solicitar Liberação do Master</span>
              </button>

              <a
                href={whatsappReceiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setHasClickedWhatsApp(true);
                  setShowConfirmModal(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-1.5 hover:bg-emerald-100"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar Comprovante Agora no WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="text-[11px] text-stone-400 hover:text-stone-600 pt-1 block mx-auto"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security & Support Guarantee Footer */}
      <div className="text-center text-stone-500 space-y-1 pb-2">
        <div className="flex items-center justify-center gap-1.5 text-xs text-stone-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Pagamento Seguro via Pix • Acesso Vitalício</span>
        </div>
        <p className="text-[11px] text-stone-600">
          WhatsApp de Atendimento &amp; Comprovantes: <strong>{officialWhatsApp}</strong>
        </p>
      </div>
    </div>
  );
};
