'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { Shield, Lock, User, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/admin/login', { email, password });

      if (res.status === 'OK') {
        localStorage.setItem('admin_token', res.token);
        router.push('/admin/dashboard');
      } else {
        setError(res.message || 'Credenciais inválidas ou acesso não autorizado.');
      }
    } catch (err) {
      console.error('Erro no login admin:', err);
      setError('Ocorreu um erro ao tentar realizar o login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adminLoginContainer">
      <style jsx>{`
        .adminLoginContainer {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0F172A;
          background-image: 
            radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.08) 0, transparent 40%),
            radial-gradient(circle at 80% 80%, rgba(37, 99, 235, 0.08) 0, transparent 40%),
            radial-gradient(circle at 50% 50%, #0F172A 0, #0F172A 100%);
          font-family: 'Inter', sans-serif;
          padding: 24px;
          overflow: hidden;
          position: relative;
        }

        .adminLoginContainer::before {
          content: '';
          position: absolute;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%);
          animation: move 20s linear infinite;
          z-index: 0;
        }

        @keyframes move {
          from { transform: translate(-30%, -30%); }
          to { transform: translate(0%, 0%); }
        }

        .loginCard {
          width: 100%;
          max-width: 440px;
          background: rgba(30, 41, 59, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 32px;
          padding: 48px;
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1), 
            0 20px 25px -5px rgba(0, 0, 0, 0.2),
            inset 0 0 0 1px rgba(255, 255, 255, 0.05);
          position: relative;
          z-index: 10;
        }

        .header {
          text-align: center;
          margin-bottom: 48px;
        }

        .iconWrapper {
          width: 72px;
          height: 72px;
          background: #0f172a;
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: #3b82f6;
          position: relative;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.15);
        }

        .iconWrapper::after {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(135deg, #3b82f6, transparent, #2563eb);
          border-radius: 24px;
          z-index: -1;
          opacity: 0.5;
        }

        h1 {
          color: white;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.025em;
          margin-bottom: 8px;
          background: linear-gradient(to bottom, #ffffff 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        p {
          color: #64748b;
          font-size: 15px;
          font-weight: 400;
        }

        .formElement {
          margin-bottom: 24px;
        }

        .labelContainer {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          margin-left: 4px;
        }

        .label {
          display: block;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .inputContainer {
          position: relative;
          display: flex;
          align-items: center;
        }

        .inputIcon {
          position: absolute;
          left: 18px;
          color: #475569;
          pointer-events: none;
          z-index: 10;
          transition: color 0.2s;
        }

        input {
          width: 100%;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(71, 85, 105, 0.2);
          border-radius: 16px;
          padding: 14px 16px;
          color: white;
          font-size: 15px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        input:hover {
          border-color: rgba(59, 130, 246, 0.3);
          background: rgba(2, 6, 23, 0.6);
        }

        input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          background: rgba(2, 6, 23, 0.8);
        }

        .inputContainer:focus-within .inputIcon {
          color: #3b82f6;
        }

        .errorBox {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.15);
          border-radius: 14px;
          padding: 14px 16px;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #f87171;
          font-size: 14px;
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }

        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }

        .submitBtn {
          width: 100%;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border: none;
          border-radius: 16px;
          padding: 16px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
        }

        .submitBtn:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.4);
          filter: brightness(1.1);
        }

        .submitBtn:active {
          transform: translateY(0);
        }

        .submitBtn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .footer {
          margin-top: 40px;
          text-align: center;
          position: relative;
        }

        .footer::before {
          content: '';
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
        }

        .backToApp {
          color: #64748b;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .backToApp:hover {
          color: #94a3b8;
          transform: scale(1.02);
        }

        .spinner {
          animation: rotate 2s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="loginCard">
        <div className="header">
          <div className="iconWrapper">
            <Shield size={36} strokeWidth={1.5} />
          </div>
          <h1>Orion Admin</h1>
          <p>Trusted Authentication Portal</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="formElement">
            <div className="labelContainer">
              <User size={14} style={{ color: '#64748b' }} />
              <label className="label" htmlFor="email">Administrative Email</label>
            </div>
            <div className="inputContainer">
              <input
                id="email"
                type="email"
                placeholder="admin@orion.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="formElement">
            <div className="labelContainer">
              <Lock size={14} style={{ color: '#64748b' }} />
              <label className="label" htmlFor="password">Security Token</label>
            </div>
            <div className="inputContainer">
              <input
                id="password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="errorBox">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <button type="submit" className="submitBtn" disabled={loading}>
            {loading ? <Loader2 className="spinner" size={20} /> : (
              <>
                Initialize Session
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="footer">
          <a href="/" className="backToApp">
            Return to Application
          </a>
        </div>
      </div>
    </div>
  );
}
